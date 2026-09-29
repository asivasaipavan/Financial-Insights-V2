export function notFound(req, res) {
  res.status(404).json({ message: 'Route not found.' });
}

export function errorHandler(err, req, res, _next) {
  console.error(err);
  if (err?.code === '23505') return res.status(409).json({ message: 'That record already exists.' });
  if (err?.name === 'ZodError') return res.status(400).json({ message: 'Invalid input.', issues: err.issues });
  res.status(err.status || 500).json({ message: err.message || 'Internal server error.' });
}
