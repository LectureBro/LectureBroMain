import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import { shadcn } from 'shadcn'; // Adjust this line based on the actual export

export default {
  plugins: [
    tailwindcss(),
    autoprefixer(),
    shadcn(), 
  ],
}
