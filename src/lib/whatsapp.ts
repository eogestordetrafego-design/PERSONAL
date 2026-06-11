export function linkWhatsApp(telefone: string, mensagem: string) {
  const digitos = telefone.replace(/\D/g, "");
  const numero = digitos.startsWith("55") ? digitos : `55${digitos}`;
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
}

export function msgCobranca(nomeAluno: string, valor: string, vencimento: string) {
  return `Olá, ${nomeAluno.split(" ")[0]}! 👋 Passando para lembrar da sua mensalidade de ${valor} com vencimento em ${vencimento}. Qualquer dúvida me chama! 💪`;
}

export function msgLembrete(nomeAluno: string, dia: string, horario: string) {
  return `Olá, ${nomeAluno.split(" ")[0]}! 👋 Lembrete do nosso treino ${dia} às ${horario}. Te espero! 💪`;
}
