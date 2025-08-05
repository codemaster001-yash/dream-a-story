
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default ({ mode }) => {
  // Load env file for the current mode in the current directory.
  // The third parameter '' loads all env variables without requiring the 'VITE_' prefix.
  const env = loadEnv(mode, '.', '');

  return defineConfig({
    plugins: [react()],
    define: {
      // Expose the API_KEY to the client-side code as process.env.API_KEY
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    }
  });
}