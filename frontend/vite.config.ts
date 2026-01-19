import { defineConfig, createLogger } from 'vite'
import react from '@vitejs/plugin-react-swc'

const customLogger = createLogger();
customLogger.warn = () => {};


// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  customLogger,
})
