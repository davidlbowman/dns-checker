"use client"

import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { type IPv4Address, checkDnsPropagation } from "@/utils/dnsChecker"
import { CheckCircle2, Wifi, XCircle } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { Suspense } from "react"

function SearchParams() {
	const searchParams = useSearchParams()
	const ipAddress = searchParams.get("ip")
	const domain = searchParams.get("domain")
	const autocheck = searchParams.get("autocheck") === "true"
	return { ipAddress, domain, autocheck }
}

function SearchParamsWrapper() {
	const params = SearchParams()
	return (
		<Home
			initialIp={params.ipAddress}
			initialDomain={params.domain}
			autocheck={params.autocheck}
		/>
	)
}

export default function Page() {
	return (
		<Suspense>
			<SearchParamsWrapper />
		</Suspense>
	)
}

function Home({
	initialIp,
	initialDomain,
	autocheck,
}: {
	initialIp?: string | null
	initialDomain?: string | null
	autocheck?: boolean
}) {
	const [ipAddress, setIpAddress] = useState<string>(initialIp || "")
	const [domain, setDomain] = useState<string>(initialDomain || "")
	const [isChecking, setIsChecking] = useState<boolean>(false)
	const [isPropagated, setIsPropagated] = useState<boolean | null>(null)
	const audioContext = useRef<AudioContext | null>(null)

	useEffect(() => {
		audioContext.current = new (
			window.AudioContext || (window as any).webkitAudioContext
		)()

		return () => {
			if (audioContext.current) {
				audioContext.current.close()
			}
		}
	}, [])

	useEffect(() => {
		if (autocheck && initialIp && initialDomain) {
			handleCheck()
		}
	}, [autocheck, initialIp, initialDomain])

	const playBeep = () => {
		if (audioContext.current) {
			const oscillator = audioContext.current.createOscillator()
			oscillator.type = "sine"
			oscillator.frequency.setValueAtTime(440, audioContext.current.currentTime)
			oscillator.connect(audioContext.current.destination)
			oscillator.start()
			oscillator.stop(audioContext.current.currentTime + 0.2)
		}
	}

	const handleCheck = async () => {
		setIsChecking(true)
		setIsPropagated(null)

		const checkInterval = setInterval(async () => {
			const { fullyPropagated } = await checkDnsPropagation({
				ipAddress: ipAddress as IPv4Address,
				domain,
			})
			if (fullyPropagated) {
				clearInterval(checkInterval)
				setIsPropagated(true)
				setIsChecking(false)
				playBeep()
			}
		}, 1000)
	}

	return (
		<main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-700 to-indigo-800 p-4">
			<Card className="w-full max-w-md mx-auto bg-white/10 backdrop-blur-md border-purple-300/20">
				<CardHeader className="space-y-1">
					<CardTitle className="text-2xl font-bold text-center text-white">
						Check DNS Propagation
					</CardTitle>
					<p className="text-sm text-center text-purple-200">
						Enter your IP address and domain to begin
					</p>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<label
							htmlFor="ipAddress"
							className="text-sm font-medium text-purple-100"
						>
							IP Address
						</label>
						<Input
							id="ipAddress"
							placeholder="Enter IP address"
							value={ipAddress}
							onChange={(e) => setIpAddress(e.target.value)}
							className="bg-white/20 border-purple-300/30 text-white placeholder-purple-300"
						/>
					</div>
					<div className="space-y-2">
						<label
							htmlFor="domain"
							className="text-sm font-medium text-purple-100"
						>
							Domain
						</label>
						<Input
							id="domain"
							placeholder="Enter domain"
							value={domain}
							onChange={(e) => setDomain(e.target.value)}
							className="bg-white/20 border-purple-300/30 text-white placeholder-purple-300"
						/>
					</div>
				</CardContent>
				<CardFooter className="flex flex-col items-center space-y-4">
					<Button
						onClick={handleCheck}
						disabled={isChecking || !ipAddress || !domain}
						className="w-full bg-purple-500 hover:bg-purple-600 text-white"
					>
						{isChecking ? (
							<span className="flex items-center justify-center">
								<Wifi className="mr-2 h-4 w-4 animate-pulse" />
								Checking...
							</span>
						) : (
							"Begin Checking"
						)}
					</Button>
					{isPropagated !== null && (
						<div
							className={`flex items-center justify-center w-full p-2 rounded-md ${
								isPropagated
									? "bg-green-500/20 text-green-100"
									: "bg-red-500/20 text-red-100"
							}`}
						>
							{isPropagated ? (
								<CheckCircle2 className="mr-2 h-5 w-5" />
							) : (
								<XCircle className="mr-2 h-5 w-5" />
							)}
							<span>{isPropagated ? "Propagated" : "Not Propagated"}</span>
						</div>
					)}
				</CardFooter>
			</Card>
		</main>
	)
}
