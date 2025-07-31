import app from './app';

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`GovFlow API server running on port ${PORT}`);
}); 