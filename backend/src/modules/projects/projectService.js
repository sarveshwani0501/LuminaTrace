// GET    /organizations/:orgId/projects         → list all projects -- repo
// POST   /organizations/:orgId/projects         → create a project
// GET    /organizations/:orgId/projects/:projId → get project details + api_key
// PUT    /organizations/:orgId/projects/:projId → update project
// DELETE /organizations/:orgId/projects/:projId → delete project

// POST /organizations/:orgId/projects/:projId/rotate-key

import * as projectRepo from "./projectRepository.js";
import { hashText } from "../../utils/hash.js";
import { slugify } from "../../utils/slugify.js";
import crypto from "crypto";

export async function getAllProjects(orgId) {
  if (!orgId) {
    throw {
      statusCode: 400,
      message: "Organization Id is NULL",
    };
  }

  const projects = await projectRepo.getAll(orgId);

  return projects;
}

export async function createNewProject(
  orgId,
  { name, description, created_by },
) {
  if (!orgId) {
    throw {
      statusCode: 400,
      message: "Organization Id is NULL",
    };
  }

  const alreadyExist = await projectRepo.doesProjectNameExists(orgId, name);

  if (alreadyExist) {
    throw {
      statusCode: 409,
      message: "A Project with this name already exists in this organization",
    };
  }
  let api_key = "lt_";
  api_key += crypto.randomBytes(32).toString("hex");

  const api_key_preview = api_key.substring(0, 12);

  const hashed_key = await hashText(api_key);

  const slug = slugify(name);

  const res = await projectRepo.createProject(orgId, {
    name,
    slug,
    description,
    created_by,
    api_key: hashed_key,
    api_key_preview,
  });

  const project = {
    id: res.id,
    name: res.name,
    slug: res.slug,
    description: res.description,
    created_by: res.created_by,
    api_key: api_key,
    retention_days: res.retention_days,
    created_at: res.created_at,
  };

  return project;
}

export async function getProjectInfo(orgId, projectId) {
  if (!orgId) {
    throw {
      statusCode: 400,
      message: "Organization Id is NULL",
    };
  }
  if (!projectId) {
    throw {
      statusCode: 400,
      message: "Project Id is NULL",
    };
  }
  const res = await projectRepo.getProjectById(orgId, projectId);
  if (!res) {
    throw {
      statusCode: 404,
      message: "Project not found",
    };
  }

  return {
    id: res.id,
    name: res.name,
    slug: res.slug,
    description: res.description,
    retention_days: res.retention_days,
    api_key_preview: res.api_key_preview,
    created_at: res.created_at,
    created_by: res.created_by,
  };
}

export async function updateProject(orgId, projectId, { name, description }) {
  if (!orgId) {
    throw {
      statusCode: 400,
      message: "Organization Id is NULL",
    };
  }
  if (!projectId) {
    throw {
      statusCode: 400,
      message: "Project Id is NULL",
    };
  }

  const res = await projectRepo.updateProjectDetails(projectId, {
    name,
    description,
  });
  if (!res) {
    throw {
      statusCode: 404,
      message: "Project not found",
    };
  }

  return {
    id: res.id,
    name: res.name,
    slug: res.slug,
    description: res.description,
    retention_days: res.retention_days,
    api_key_preview: res.api_key_preview,
    created_at: res.created_at,
    created_by: res.created_by,
  };
}

export async function deleteProject(orgId, projectId) {
  if (!orgId) {
    throw {
      statusCode: 400,
      message: "Organization Id is NULL",
    };
  }
  if (!projectId) {
    throw {
      statusCode: 400,
      message: "Project Id is NULL",
    };
  }

  const res = await projectRepo.deleteProject(projectId);

  if (!res) {
    throw {
      statusCode: 404,
      message: "Project not found",
    };
  }

  return res;
}

export async function updateAPIKey(orgId, projectId) {
  if (!orgId) {
    throw {
      statusCode: 400,
      message: "Organization Id is NULL",
    };
  }
  if (!projectId) {
    throw {
      statusCode: 400,
      message: "Project Id is NULL",
    };
  }

  let api_key = "lt_";
  api_key += crypto.randomBytes(32).toString("hex");

  const api_key_preview = api_key.substring(0, 12);

  const hashed_key = await hashText(api_key);

  const res = await projectRepo.updateAPIKey(
    projectId,
    orgId,
    api_key_preview,
    hashed_key,
  );

  const project = {
    id: res.id,
    name: res.name,
    slug: res.slug,
    description: res.description,
    created_by: res.created_by,
    api_key: api_key,
    retention_days: res.retention_days,
    created_at: res.created_at,
  };

  return project;
}
