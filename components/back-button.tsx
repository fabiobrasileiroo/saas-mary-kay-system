import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BackButtonProps {
  href: string
}

export function BackButton({ href }: BackButtonProps) {
  return (
    <Link href={href}>
      <Button variant="outline" size="sm" className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar
      </Button>
    </Link>
  )
}

