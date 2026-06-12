import { describe, expect, it } from "vitest";
import { brl, brlFull, idade, iniciais } from "@/lib/format";

// Intl usa espaço não separável (U+00A0) entre "R$" e o número
const normaliza = (s: string) => s.replace(/\u00A0/g, " ");

describe("brl", () => {
  it("formata inteiro em reais sem centavos", () => {
    expect(normaliza(brl(4980))).toBe("R$ 4.980");
  });
  it("formata zero", () => {
    expect(brl(0)).toContain("0");
  });
});

describe("brlFull", () => {
  it("inclui centavos", () => {
    expect(normaliza(brlFull(799))).toBe("R$ 799,00");
  });
});

describe("iniciais", () => {
  it("duas palavras viram duas letras", () => {
    expect(iniciais("Ana Lima")).toBe("AL");
  });
  it("uma palavra vira uma letra", () => {
    expect(iniciais("Rafael")).toBe("R");
  });
  it("ignora nomes do meio além do segundo", () => {
    expect(iniciais("Carla Mendes Souza")).toBe("CM");
  });
});

describe("idade", () => {
  it("calcula idade corretamente", () => {
    const hoje = new Date();
    const nasc = new Date(hoje.getFullYear() - 30, hoje.getMonth(), 1);
    expect(idade(nasc.toISOString().slice(0, 10))).toBe(30);
  });
  it("retorna null sem data", () => {
    expect(idade(null)).toBeNull();
  });
});
