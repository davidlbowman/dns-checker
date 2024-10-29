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
import { CheckCircle2, XCircle } from "lucide-react"
import { useEffect, useRef, useState } from "react"

export default function Component() {
	const [ipAddress, setIpAddress] = useState<string>("")
	const [domain, setDomain] = useState<string>("")
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

	const playBeep = () => {
		if (audioContext.current) {
			const oscillator = audioContext.current.createOscillator()
			oscillator.type = "sine"
			oscillator.frequency.setValueAtTime(440, audioContext.current.currentTime) // 440 Hz - A4 note
			oscillator.connect(audioContext.current.destination)
			oscillator.start()
			oscillator.stop(audioContext.current.currentTime + 0.2) // Beep for 200ms
		}
	}

	const handleCheck = async () => {
		setIsChecking(true)
		setIsPropagated(null)

		const checkInterval = setInterval(async () => {
			const result = await checkDnsPropagation({
				ipAddress: ipAddress as IPv4Address,
				domain,
			})
			if (result) {
				clearInterval(checkInterval)
				setIsPropagated(true)
				setIsChecking(false)
				playBeep()
			}
		}, 1000)
	}

	return (
		<Card className="w-full max-w-md mx-auto">
			<CardHeader>
				<CardTitle>Check DNS Propagation</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="space-y-2">
					<label htmlFor="ipAddress" className="text-sm font-medium">
						IP Address
					</label>
					<Input
						id="ipAddress"
						placeholder="Enter IP address"
						value={ipAddress}
						onChange={(e) => setIpAddress(e.target.value)}
					/>
				</div>
				<div className="space-y-2">
					<label htmlFor="domain" className="text-sm font-medium">
						Domain
					</label>
					<Input
						id="domain"
						placeholder="Enter domain"
						value={domain}
						onChange={(e) => setDomain(e.target.value)}
					/>
				</div>
			</CardContent>
			<CardFooter className="flex justify-between items-center">
				<Button
					onClick={handleCheck}
					disabled={isChecking || !ipAddress || !domain}
				>
					{isChecking ? "Checking..." : "Begin Checking"}
				</Button>
				{isPropagated !== null && (
					<div className="flex items-center">
						{isPropagated ? (
							<CheckCircle2 className="text-green-500 mr-2" />
						) : (
							<XCircle className="text-red-500 mr-2" />
						)}
						<span>{isPropagated ? "Propagated" : "Not Propagated"}</span>
					</div>
				)}
			</CardFooter>
		</Card>
	)
}
