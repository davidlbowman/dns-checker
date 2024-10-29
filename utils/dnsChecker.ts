import * as dns from "node:dns"

type IPv4Address = `${number}.${number}.${number}.${number}`

interface DnsCheckOptions {
	ipAddress: IPv4Address
	domain: string
}

export default async function checkDnsPropagation(
	options: DnsCheckOptions,
): Promise<boolean> {
	try {
		const addresses = await dns.promises.resolve4(options.domain)
		return addresses.includes(options.ipAddress)
	} catch (error) {
		return false
	}
}
