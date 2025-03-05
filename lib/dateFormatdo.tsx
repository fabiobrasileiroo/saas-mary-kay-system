import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const formatDate = (date: string | Date, formatType: "full" | "short" | "medium"): string => {
  const parsedDate = typeof date === "string" ? new Date(date) : date;

  const formats = {
    full: "dd/MM/yyyy HH:mm:ss", // Exemplo: 03/03/2025 00:17:25
    short: "dd/MM",             // Exemplo: 03/03
    medium: "dd/MM/yyyy",        // Exemplo: 03/03/2025
  };

  return format(parsedDate, formats[formatType], { locale: ptBR });
};
