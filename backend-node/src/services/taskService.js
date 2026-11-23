const Task = require('../models/task');
const { HttpError } = require('../errors');
const mongoose = require('mongoose');

const STATUSES = ['open', 'done'];

// ---------- mapping ----------

function toDto(doc) {
  return {
    id: String(doc._id),
    title: doc.title,
    description: doc.description ?? '',
    priority: doc.priority,
    dueDate: doc.dueDate
      ? doc.dueDate.toISOString().slice(0, 10)
      : null,
    status: doc.status,
    createdAt: doc.createdAt,
  };
}

// ---------- validation ----------

/**
 * Validates a create/update payload and returns the fields to store.
 * partial = true for PATCH (all fields optional).
 */
function validateTaskInput(body, { partial }) {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    throw new HttpError(400, 'Request body must be a JSON object');
  }

  const data = {};

  if (body.title !== undefined || !partial) {
    if (typeof body.title !== 'string' || body.title.trim() === '') {
      throw new HttpError(400, 'title is required and must not be blank');
    }
    if (body.title.trim().length > 200) {
      throw new HttpError(400, 'title must be at most 200 characters');
    }
    data.title = body.title.trim();
  }

  if (body.description !== undefined) {
    if (typeof body.description !== 'string' || body.description.length > 2000) {
      throw new HttpError(400, 'description must be a string with at most 2000 characters');
    }
    data.description = body.description;
  }

  if (body.priority !== undefined) {
    if (!Number.isInteger(body.priority) || body.priority < 1 || body.priority > 10) { // priority is an integer between 1 and 10
      throw new HttpError(400, 'priority must be an integer between 1 and 10'); 
    }
    data.priority = body.priority;
  }

  // dueDate is optional - normalise "no due date" to null
  if (body.dueDate !== undefined) {
    if (body.dueDate !== null &&
        (typeof body.dueDate !== 'string' ||
        !isValidCalendarDate(body.dueDate))) {
      throw new HttpError(400, 'dueDate must be a valid date');
    }

    data.dueDate = body.dueDate
      ? new Date(`${body.dueDate}T00:00:00.000Z`)
      : null;
  }

  if (body.status !== undefined) {
    if (!STATUSES.includes(body.status)) {
      throw new HttpError(400, "status must be 'open' or 'done'");
    }
    data.status = body.status;
  }

  return data;
}

function isValidCalendarDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day;
}

// ---------- service functions ----------

function validateTaskId(id) {
  if (!/^[a-fA-F0-9]{24}$/.test(id) || !mongoose.isValidObjectId(id)) {
    throw new HttpError(400, 'Malformed task id');
  }
}

async function listTasks(query) {
  // Werte zuerst validieren
  const filter = {};

  if (query.status !== undefined) {
    if (!['open', 'done'].includes(query.status)) {
      throw new HttpError(400, "status must be 'open' or 'done'");
    }
    filter.status = query.status;
  }

  if (query.minPriority !== undefined) {
    if (!/^\d+$/.test(query.minPriority)) {
      throw new HttpError(400, 'minPriority must be an integer between 1 and 10');
    }

    const minPriority = Number(query.minPriority);
    if (minPriority < 1 || minPriority > 10) {
      throw new HttpError(400, 'minPriority must be an integer between 1 and 10');
    }
    filter.priority = { $gte: minPriority };
  }

  const sortFields = ['priority', 'dueDate', 'createdAt'];
  const sort = sortFields.includes(query.sort) ? query.sort : 'priority';

  if (query.sort !== undefined && !sortFields.includes(query.sort)) {
    throw new HttpError(400, "sort must be 'priority', 'dueDate' or 'createdAt'");
  }

  const order = query.order ?? 'desc';
  if (!['asc', 'desc'].includes(order)) {
    throw new HttpError(400, "order must be 'asc' or 'desc'");
  }

  const direction = order === 'asc' ? 1 : -1;
  const docs = await Task.find(filter)
    .sort({ [sort]: direction, _id: -1 })
    .lean();

  return docs.map(toDto);
}

async function getTask(id) {
  validateTaskId(id);
  const doc = await Task.findById(id).lean();
  if (!doc) throw new HttpError(404, 'Task not found');
  return toDto(doc);
}

async function createTask(body) {
  const data = validateTaskInput(body, { partial: false });
  const doc = await Task.create(data);
  return toDto(doc);
}

async function updateTask(id, body) {
  validateTaskId(id);
  const data = validateTaskInput(body, { partial: true });
  const doc = await Task.findByIdAndUpdate(id, data, { new: true }).lean(); // return the updated document
  if (!doc) throw new HttpError(404, 'Task not found');
  return toDto(doc);
}

async function deleteTask(id) {
  validateTaskId(id);
  const doc = await Task.findByIdAndDelete(id).lean();
  if (!doc) throw new HttpError(404, 'Task not found');
}

module.exports = { listTasks, getTask, createTask, updateTask, deleteTask };
