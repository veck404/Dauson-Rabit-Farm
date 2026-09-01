# Dauson Farm OS

A fresh Next.js and Tailwind rabbit farm management system for digitising herd, pedigree, breeding, litter, health, feed, inventory, finance and task records.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000` on this computer.

### Test on another device

The development server listens on your local network by default. Connect the
other device to the same Wi-Fi or LAN, then find this computer's IPv4 address:

```powershell
ipconfig
```

On the other device, open `http://<IPv4-address>:3000` — for example,
`http://192.168.1.25:3000`. Keep `npm run dev` running while testing. If Windows
asks for network access, allow Node.js on private networks. Use the port printed
by Next.js if port 3000 is already occupied.

Rabbit registry changes are saved to the browser automatically. Farm records can be filtered, sorted and exported to PDF or Excel.

## Local preview login

Use the following credentials to access the local interface:

- Email: `admin@dausonfarm.com`
- Password: `Farm@2026`

Login sessions expire automatically after six hours.

This is a client-side preview gate. Replace it with server-side authentication
before deploying the application to production.
