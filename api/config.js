module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const url = process.env.SUPABASE_URL;
  const anon_key = process.env.SUPABASE_ANON_KEY;
  if (!url || !anon_key) {
    return res.status(500).json({ error: 'SUPABASE_URL e SUPABASE_ANON_KEY não configurados' });
  }
  return res.status(200).json({ url, anon_key });
};
