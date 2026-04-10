import * as alertRepo from "./alertRepository.js";
import redis from "../../config/redis.js";
import config from "../../config/index.js";
import nodemailer from "nodemailer";
import logger from "../../utils/logger.js";

const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  auth: {
    user: config.smtp.user,
    pass: config.smtp.pass,
  },
});

export { transporter };

// Checking if any alert exists for the current situation

export function evaluateRule(rule, currValue) {
  if (rule.condition === "gt") {
    return currValue > rule.threshold;
  } else if (rule.condition === "lt") {
    return currValue < rule.threshold;
  }
  return false;
}

export async function checkAndFireAlerts(
  projectId,
  metricName,
  currentValue,
  serverId,
  serverName,
) {
  try {
    // first we need to get all rules
    const rules = await alertRepo.getActiveRules(projectId, metricName);

    for (const rule of rules) {
      const shouldFire = evaluateRule(rule, currentValue);

      const activeEvents = await alertRepo.getActiveEvent(rule.id, serverId);

      if (shouldFire) {
        await fireAlert(rule, currentValue, serverId, serverName);
      } else if (!shouldFire && activeEvents) {
        // needs to be resolved
        await resolveAlert(rule, serverId, serverName);
      }
    }
  } catch (err) {
    logger.error({ err, projectId, metricName }, "Error checking alerts");
  }
}

async function fireAlert(rule, value, serverId, serverName) {
  const lockKey = `lock:alert:${rule.id}:${serverId}`;

  const activeEvent = await alertRepo.getActiveEvent(rule.id, serverId);

  let cooldown = 60;

  if (activeEvent) {
    const duration = Date.now() - new Date(activeEvent.triggered_at);
    const minutes = Math.floor(duration / 60000);

    if (minutes < 5) {
      cooldown = 60;
    } else if (minutes < 30) {
      cooldown = 300;
    } else {
      cooldown = 900;
    }
  }

  const acquired = await redis.set(lockKey, "locked", "NX", "EX", 60);

  if (!acquired) {
    logger.debug(
      { ruleId: rule.id, serverId },
      "Alert lock already acquired, skipping",
    );
    return;
  }

  try {
    const isNew = !activeEvent;

    await sendAlertEmail(rule, value, serverId, serverName, isNew);
    // first time the alert is triggered
    // only save that instance in db
    // the following events will be considered as reminders
    if (isNew) {
      await alertRepo.createAlertEvent(rule.id, serverId, value);
      logger.info({ ruleId: rule.id, serverId, value }, "Alert Fired");
    } else {
      logger.info({ ruleId: rule.id, serverId, value }, "Alert Reminder Sent");
    }
  } catch (err) {
    logger.error({ err, ruleId: rule.id }, "Failed to fire alert");
    await redis.del(lockKey);
  }
}

async function resolveAlert(rule, serverId, serverName) {
  try {
    await alertRepo.resolveEvent(rule.id, serverId);

    if (config.alerts?.sendResolvedEmails) {
      await sendResolvedEmail(rule, serverId, serverName);
    }

    logger.info({ ruleId: rule.id, serverId }, "Alert Resolved");
  } catch (err) {
    logger.error({ err, rule: rule.id }, "Failed to resolve alert");
  }
}

async function sendAlertEmail(rule, value, serverId, serverName, isNew) {
  const subject = isNew
    ? `Alert: ${rule.metric_name} threshold exceeded`
    : `⚠️ Ongoing: ${rule.metric_name} still high`;

  let serverContext = "";
  if (serverId && serverName) {
    serverContext = `
      Server: ${serverName}
      Server ID: ${serverId}`;
  }

  const emailBody = `
${isNew ? "NEW ALERT TRIGGERED" : "ONGOING ALERT"}

Metric: ${rule.metric_name}
Current Value: ${value}
Threshold: ${rule.threshold}
Condition: ${rule.condition === "gt" ? "Greater than" : "Less than"}
${serverContext}
Status: ${isNew ? "FIRING" : "STILL ACTIVE"}

Time: ${new Date().toISOString()}

${
  isNew
    ? "This is a new alert that just triggered."
    : "This alert is still active. You will receive reminders every 60 seconds while the condition persists."
}
  `.trim();

  await transporter.sendMail({
    from: config.smtp.from,
    to: rule.notification_email,
    subject: subject,
    text: emailBody,
  });
}

//

async function sendResolvedEmail(rule, serverId, serverName) {
  let serverContext = "";
  if (serverId && serverName) {
    serverContext = `
    Server: ${serverName}
    Server ID: ${serverId}`;
  }

  const emailBody = `
✅ ALERT RESOLVED

Metric: ${rule.metric_name}
${serverContext}
The metric has returned to normal levels.

Time: ${new Date().toISOString()}
  `.trim();

  await transporter.sendMail({
    from: config.smtp.from,
    to: rule.notification_email,
    subject: ` Resolved: ${rule.metric_name} back to normal`,
    text: emailBody,
  });
}

//
//
//
//

// for dashboard

export async function createRule(
  { metricName, condition, threshold, email },
  projectId,
) {
  if (
    !metricName ||
    !condition ||
    !threshold ||
    threshold === null ||
    !email ||
    !projectId
  ) {
    throw {
      statusCode: 404,
      message: "Missing required fields",
    };
    //
  }
  try {
    const createdRule = await alertRepo.createAlertRule(
      projectId,
      metricName,
      condition,
      threshold,
      email,
    );

    return createdRule;
  } catch (err) {
    if (err.statusCode) throw err;
    logger.error({ err }, "Failed to create alert rule");
    throw {
      statusCode: 500,
      message: `Failed to create alert Rule`,
    };
  }
}

//
//

export async function listAllRules(projectId) {
  if (!projectId) {
    throw { statusCode: 400, message: "Project ID is required" };
  }
  const rules = await alertRepo.getAllRules(projectId);
  return { rules };
}

//
//

export async function getRuleById(projectId, ruleId) {
  if (!projectId || !ruleId) {
    throw { statusCode: 400, message: "Missing parameters" };
  }

  const rule = await alertRepo.getRuleById(ruleId, projectId);
  if (!rule) {
    throw { statusCode: 404, message: "Rule not found" };
  }

  return rule;
}

//
//

export async function updateRule(projectId, ruleId, threshold, email) {
  if (!projectId || !ruleId) {
    throw { statusCode: 400, message: "Missing parameters" };
  }

  const rule = await alertRepo.updateRuleById(
    ruleId,
    projectId,
    threshold,
    email,
  );
  if (!rule) {
    throw { statusCode: 404, message: "Rule not found" };
  }

  return rule;
}

//
//

export async function deleteRule(projectId, ruleId) {
  if (!projectId || !ruleId) {
    throw { statusCode: 400, message: "Missing parameters" };
  }

  const deleted = await alertRepo.deleteRuleById(ruleId, projectId);
  if (!deleted) {
    throw { statusCode: 404, message: "Rule not found" };
  }

  return { message: "Rule deleted successfully" };
}

//
//

export async function toggleRuleActivity(projectId, ruleId, isActive) {
  if (!projectId || !ruleId) {
    throw {
      statusCode: 400,
      message: "Missing Parameters",
    };
  }

  const rule = await alertRepo.toggleRuleActive(projectId, ruleId, isActive);
  if (!rule) {
    throw { statusCode: 404, message: "Rule not found" };
  }

  return {
    message: "Rule status updated",
    isActive: rule.is_active,
  };
}

//
//

export async function getAllEvents(projectId, filters) {
  if (!projectId) {
    throw { statusCode: 400, message: "Project ID is required" };
  }

  const events = await alertRepo.getEventsByProjectId(projectId, filters);
  return { events };
}

//
//
