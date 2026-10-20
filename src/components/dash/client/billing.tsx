"use client";

import type { AccountPurchase } from "@/lib/server/account";
import { IconCard } from "../../icons";
import { Block, PageHeader, Pill, Table, Td } from "../ui";
import { DiscordButton, EmptyState, formatDate } from "./common";

const zl = (grosze: number) => `${(grosze / 100).toLocaleString("pl-PL", { minimumFractionDigits: grosze % 100 ? 2 : 0 })} zł`;

export function ClientBilling({ purchases }: { purchases: AccountPurchase[] }) {
  return (
    <>
      <PageHeader title="Zakupy" desc="Pakiety opłacone na Discordzie i przypisane do Twojego konta." actions={<DiscordButton>Kup lub przedłuż</DiscordButton>} />
      <Block pad={false}>
        {purchases.length === 0 ? (
          <EmptyState Icon={IconCard} title="Nie masz jeszcze żadnych zakupów">
            Gdy kupisz pakiet na Discordzie, zakup pojawi się tutaj razem z kwotą i datą.
          </EmptyState>
        ) : (
          <Table head={["Pakiet", "Okres", "Data", "Kwota", "Status"]}>
            {purchases.map((p) => (
              <tr key={p.id}>
                <Td>{p.planName}</Td>
                <Td className="text-muted">{p.billing === "lifetime" ? "dożywotnio" : "30 dni"}</Td>
                <Td className="text-muted">{formatDate(p.createdAt)}</Td>
                <Td className="tabular-nums">{zl(p.amount)}</Td>
                <Td>
                  <Pill tone={p.status === "paid" ? "ok" : "danger"}>{p.status === "paid" ? "opłacony" : "zwrot"}</Pill>
                </Td>
              </tr>
            ))}
          </Table>
        )}
      </Block>
    </>
  );
}
