// vite.config.js
// import basicSsl from '@vitejs/plugin-basic-ssl'
// import legacy from '@vitejs/plugin-legacy';
// import { defineConfig } from 'vite';

// export default defineConfig {
//     server: {
//       https: true,
//     },
//     plugins: [
//         basicSsl(),
//         legacy({targets: ['defaults', 'not IE 11'],})
//     ]
//   };
  

// vite.config.js
import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy';

export default defineConfig({
  plugins: [
    // ...other plugins
    legacy({
      targets: ['defaults', 'not IE 11'], // Specify the target browsers you want to support
    }),
  ],
});
