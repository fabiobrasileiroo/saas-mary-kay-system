import Image from "next/image";
import { Button } from "@/components/ui/button";
import { LogInIcon } from "lucide-react";
import { SignInButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const LoginPage = async () => {
  const { userId } = await auth();
  if (userId) {
    redirect("/");
  }
  return (
    <div className="flex md:h-screen flex-col-reverse md:grid md:grid-cols-2 bg-background">
      {/* ESQUERDA*/}
      <div className="flex flex-col justify-center p-6 md:p-8 max-w-lg mx-auto text-center md:text-left">
        <Image
          src="/marykayflow.png"
          width={150}
          height={39}
          alt="Mary key flow"
          className="mx-auto md:mx-0"
        />
        <h1 className="mb-3 text-3xl md:text-4xl font-bold">Bem-vindo</h1>
        <p className="mb-6 text-muted-foreground">
          A SAAS Mary Kay Flow é uma plataforma de gestão financeira para
          monitorar suas movimentações, oferecer insights personalizados e
          facilitar o controle do seu orçamento.
        </p>
        <SignInButton>
          <Button className="mt-2" variant="outline">
            <LogInIcon className="mr-2" />
            Fazer login ou criar conta
          </Button>
        </SignInButton>
      </div>
      {/* DIREITA */}
      <div className="relative w-full h-60 md:h-full md:block">
        <Image
          src="/bg-login.svg"
          alt="Faça login"
          fill
          className="object-cover object-center"
          priority
          quality={100}
        />
      </div>
    </div>
  );
};

export default LoginPage;
;