// GET    /organizations/:orgId/projects         → list all projects -- repo
// POST   /organizations/:orgId/projects         → create a project
// GET    /organizations/:orgId/projects/:projId → get project details + api_key
// PUT    /organizations/:orgId/projects/:projId → update project
// DELETE /organizations/:orgId/projects/:projId → delete project

// POST /organizations/:orgId/projects/:projId/rotate-key

import * as projectService from "./projectService.js";

export async function getAllProjectsHandler(req, reply) {
  try {
    const { orgId } = req.params;
    const res = await projectService.getAllProjects(orgId);
    return reply.code(200).send(res);
  } catch (error) {
    throw error;
  }
}

export async function getProjectInfoHandler(req, reply) {
  try {
    const { orgId, projId } = req.params;
    const res = await projectService.getProjectInfo(orgId, projId);
    return reply.code(200).send(res);
  } catch (error) {
    throw error;
  }
}

export async function createProjectHandler(req, reply) {
  try {
    const { orgId } = req.params;
    const { name, description } = req.body;
    const created_by = req.user.userId;
    const res = await projectService.createNewProject(orgId, {
      name,
      description,
      created_by,
    });

    return reply.code(201).send(res);
  } catch (error) {
    throw error;
  }
}

export async function deleteProjectHandler(req, reply) {
  try {
    const { orgId, projId } = req.params;
    const res = await projectService.deleteProject(orgId, projId);
    if (!res) {
      throw {
        statusCode: 404,
        message: "Project not found",
      };
    }
    return reply.code(200).send({
      message: "Project deleted successfully",
    });
  } catch (error) {
    throw error;
  }
}

export async function updateProjectInfoHandler(req, reply) {
  try {
    const { orgId, projId } = req.params;
    const { name, description } = req.body;

    const res = await projectService.updateProject(orgId, projId, {
      name,
      description,
    });

    return reply.code(200).send(res);
  } catch (error) {
    throw error;
  }
}

export async function updateAPIKeyHandler(req, reply) {
  try {
    const { orgId, projId } = req.params;
    const res = await projectService.updateAPIKey(orgId, projId);

    return reply.code(200).send(res);
  } catch (error) {
    throw error;
  }
}
