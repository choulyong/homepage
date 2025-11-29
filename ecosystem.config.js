module.exports = {
  apps: [
    {
      name: 'metaldragon',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3009',
      cwd: 'C:\Vibe Coding\Rock Community\metaldragon',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3009,
      },
    },
  ],
};
