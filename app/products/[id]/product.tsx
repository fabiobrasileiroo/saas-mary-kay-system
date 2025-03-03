import { getProduct } from "@/lib/actions";

export async function getServerSideProps({ params }: { params: { id: string } }) {
  // Aqui você faz a chamada para buscar o produto usando o id
  const data = await getProduct(params.id);

  if (!data) {
    return {
      notFound: true, // Retorna uma página 404 se não encontrar o produto
    };
  }

  // Retorna as props para o componente
  return {
    props: {
      product: {
        ...data,
        createdAt: data.createdAt.toISOString(),
        updatedAt: data.updatedAt.toISOString(),
      },
    },
  };
}
