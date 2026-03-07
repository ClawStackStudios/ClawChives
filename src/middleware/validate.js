import { z } from "zod";

export const validateBody = (schema) => async (req, res, next) => {
  try {
    req.body = await schema.parseAsync(req.body);
    next();
  } catch (error) {
    if (error && (error.name === 'ZodError' || error instanceof z.ZodError || Array.isArray(error.errors))) {
      let issues = [];
      if (Array.isArray(error.issues)) issues = error.issues;
      else if (Array.isArray(error.errors)) issues = error.errors;
      else if (error.errors && Array.isArray(error.errors.issues)) issues = error.errors.issues;
      else issues = [error];

      const parsedIssues = Array.isArray(issues) ? issues : [];
      return res.status(400).json({
        success: false,
        error: "Validation Error: Your request form is malformed",
        details: parsedIssues.map(e => ({ path: e && Array.isArray(e.path) ? e.path.join('.') : '', message: e && e.message ? e.message : 'Invalid field' }))
      });
    }
    next(error);
  }
};
