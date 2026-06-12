import { describe, expect, it } from "vitest";
import { linkWhatsApp, msgCobranca, msgLembrete } from "@/lib/whatsapp";

describe("linkWhatsApp", () => {
  it("normaliza telefone com máscara e adiciona DDI 55", () => {
    expect(linkWhatsApp("(11) 99999-8888", "oi")).toBe(
      "https://wa.me/5511999998888?text=oi"
    );
  });
  it("não duplica o 55 quando já presente", () => {
    expect(linkWhatsApp("5511999998888", "oi")).toContain("wa.me/5511999998888");
  });
  it("codifica a mensagem na URL", () => {
    expect(linkWhatsApp("11999998888", "olá, tudo bem?")).toContain(
      encodeURIComponent("olá, tudo bem?")
    );
  });
});

describe("mensagens prontas", () => {
  it("cobrança usa primeiro nome, valor e vencimento", () => {
    const msg = msgCobranca("Ana Lima", "R$ 799,00", "05/07");
    expect(msg).toContain("Ana");
    expect(msg).not.toContain("Lima");
    expect(msg).toContain("R$ 799,00");
    expect(msg).toContain("05/07");
  });
  it("lembrete usa primeiro nome, dia e horário", () => {
    const msg = msgLembrete("Bruno Gomes", "amanhã", "07:00");
    expect(msg).toContain("Bruno");
    expect(msg).toContain("amanhã");
    expect(msg).toContain("07:00");
  });
});
