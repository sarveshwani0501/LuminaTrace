import * as alertService from "./alertService.js";

export async function createRule(req, reply) {
  try {
    const projectId = req.query.projectId;
    const rule = await alertService.createRule(req.body, projectId);
    return reply.code(201).send(rule);
  } catch (error) {
    req.log.error(error);
    return reply
      .code(error.statusCode || 500)
      .send({ message: error.message || "Internal Server Error" });
  }
}

export async function listAllRules(req, reply) {
  try {
    const projectId = req.query.projectId;
    const rules = await alertService.listAllRules(projectId);
    return reply.send(rules);
  } catch (error) {
    req.log.error(error);
    return reply
      .code(error.statusCode || 500)
      .send({ message: error.message || "Internal Server Error" });
  }
}

export async function getRuleById(req, reply) {
  try {
    const projectId = req.query.projectId;
    const ruleId = req.params.id;
    const rule = await alertService.getRuleById(projectId, ruleId);
    if (!rule) {
      return reply.code(404).send({ message: "Rule not found" });
    }
    return reply.send(rule);
  } catch (error) {
    req.log.error(error);
    return reply
      .code(error.statusCode || 500)
      .send({ message: error.message || "Internal Server Error" });
  }
}

export async function updateRule(req, reply) {
  try {
    const projectId = req.query.projectId;
    const ruleId = req.params.id;
    const { threshold, email } = req.body;
    const updatedRule = await alertService.updateRule(
      projectId,
      ruleId,
      threshold,
      email,
    );
    if (!updatedRule) {
      return reply.code(404).send({ message: "Rule not found" });
    }
    return reply.send(updatedRule);
  } catch (error) {
    req.log.error(error);
    return reply
      .code(error.statusCode || 500)
      .send({ message: error.message || "Internal Server Error" });
  }
}

export async function deleteRule(req, reply) {
  try {
    const projectId = req.query.projectId;
    const ruleId = req.params.id;
    const result = await alertService.deleteRule(projectId, ruleId);
    return reply.send(result);
  } catch (error) {
    req.log.error(error);
    return reply
      .code(error.statusCode || 500)
      .send({ message: error.message || "Internal Server Error" });
  }
}

export async function toggleRuleActivity(req, reply) {
  try {
    const projectId = req.query.projectId;
    const ruleId = req.params.id;
    const { isActive } = req.body;
    const result = await alertService.toggleRuleActivity(
      projectId,
      ruleId,
      isActive,
    );
    return reply.send(result);
  } catch (error) {
    req.log.error(error);
    return reply
      .code(error.statusCode || 500)
      .send({ message: error.message || "Internal Server Error" });
  }
}

export async function getAllEvents(req, reply) {
  try {
    const projectId = req.query.projectId;
    const result = await alertService.getAllEvents(projectId, req.query);
    return reply.send(result);
  } catch (error) {
    req.log.error(error);
    return reply
      .code(error.statusCode || 500)
      .send({ message: error.message || "Internal Server Error" });
  }
}
