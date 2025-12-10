// simpletodolesson.client/vite.config.js

import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import plugin from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { env } from 'process'

// --- НОВЕ: прапорець для вмикання HTTPS ---
const useHttps = env.USE_HTTPS === "true"

// Шляхи до сертифікатів (використовуються лише локально)
const baseFolder =
    env.APPDATA && env.APPDATA !== ''
        ? `${env.APPDATA}/ASP.NET/https`
        : `${env.HOME}/.aspnet/https`

const certificateName = "simpletodolesson.client"
const certFilePath = path.join(baseFolder, `${certificateName}.pem`)
const keyFilePath = path.join(baseFolder, `${certificateName}.key`)

// Формування URL API
const target = env.ASPNETCORE_HTTPS_PORT
    ? `https://localhost:${env.ASPNETCORE_HTTPS_PORT}`
    : env.ASPNETCORE_URLS
        ? env.ASPNETCORE_URLS.split(';')[0]
        : 'https://localhost:7154'

// --- ЕКСПОРТ КОНФІГУ ---
export default defineConfig({
    plugins: [plugin()],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    server: {
        proxy: {
            '^/article': { target, secure: false },
            '^/account': { target, secure: false },
            '^/comment': { target, secure: false },
            '^/bonus': { target, secure: false }
        },
        port: parseInt(env.DEV_SERVER_PORT || '51424'),

        // --- ГОЛОВНЕ: HTTPS умикається тільки локально ---
        https: useHttps
            ? {
                  key: fs.readFileSync(keyFilePath),
                  cert: fs.readFileSync(certFilePath),
              }
            : false
    }
})
