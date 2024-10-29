"use server"

import * as dns from "node:dns"

export type IPv4Address = `${number}.${number}.${number}.${number}`

interface DnsCheckOptions {
	ipAddress: IPv4Address
	domain: string
}

const DNS_SERVERS = {
	Google: "8.8.8.8",
	Cloudflare: "1.1.1.1",
	OpenDNS: "208.67.222.222",
	Quad9: "9.9.9.9",
	AdGuard: "94.140.14.14",
} as const

export type DnsResult = {
	server: keyof typeof DNS_SERVERS
	resolved: boolean
	ip?: string
}

export async function checkDnsPropagation(options: DnsCheckOptions): Promise<{
	fullyPropagated: boolean
	results: DnsResult[]
}> {
	const results: DnsResult[] = []

	for (const [serverName, serverIp] of Object.entries(DNS_SERVERS)) {
		try {
			const resolver = new dns.promises.Resolver()
			resolver.setServers([serverIp])
			const addresses = await resolver.resolve4(options.domain)

			results.push({
				server: serverName as keyof typeof DNS_SERVERS,
				resolved: addresses.includes(options.ipAddress),
				ip: addresses[0],
			})
		} catch (error) {
			results.push({
				server: serverName as keyof typeof DNS_SERVERS,
				resolved: false,
			})
		}
	}

	const fullyPropagated = results.every((result) => result.resolved)

	return {
		fullyPropagated,
		results,
	}
}
