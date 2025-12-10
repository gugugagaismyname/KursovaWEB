// simpletodolesson.client/vite.config.js (Виправлена версія)

import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import plugin from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import child_process from 'child_process';
import { env } from 'process';

const baseFolder =
    env.APPDATA !== undefined && env.APPDATA !== ''
        ? `${env.APPDATA}/ASP.NET/https`
        : `${env.HOME}/.aspnet/https`;

const certificateName = "simpletodolesson.client";
const certFilePath = path.join(baseFolder, `${certificateName}.pem`);
const keyFilePath = path.join(baseFolder, `${certificateName}.key`);

// --- ПОЧАТОК ЗМІН: ЦЕЙ БЛОК КОМЕНТУЄМО ДЛЯ DOCKER BUILD ---
/*
if (!fs.existsSync(baseFolder)) {
    fs.mkdirSync(baseFolder, { recursive: true });
}

if (!fs.existsSync(certFilePath) || !fs.existsSync(keyFilePath)) {
    if (0 !== child_process.spawnSync('dotnet', [
        'dev-certs',
        'https',
        '--export-path',
        certFilePath,
        '--format',
        'Pem',
        '--no-password',
    ], { stdio: 'inherit', }).status) {
        throw new Error("Could not create certificate.");
    }
}
*/
// --- КІНЕЦЬ ЗМІН: ЦЕЙ БЛОК КОМЕНТУЄМО ДЛЯ DOCKER BUILD ---


const target = env.ASPNETCORE_HTTPS_PORT ? `https://localhost:${env.ASPNETCORE_HTTPS_PORT}` :
    env.ASPNETCORE_URLS ? env.ASPNETCORE_URLS.split(';')[0] : 'https://localhost:7154';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [plugin()],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    server: {
        proxy: {
            '^/article': {
                target,
                secure: false
            },
            '^/account': {
                target,
                secure: false
            },
            '^/comment': {
                target,
                secure: false
            },
            '^/bonus': {
                target,
                secure: false
            }
        },
        port: parseInt(env.DEV_SERVER_PORT || '51424'),
        // Секція HTTPS. Хоча вона і використовує закоментовані вище змінні,
        // вона не активується при "vite build" (production), тому її можна залишити.
        // Якщо буде нова помилка, ми приберемо і її.
        https: {
            key: fs.readFileSync(keyFilePath),
            cert: fs.readFileSync(certFilePath),
        }
    }
})
