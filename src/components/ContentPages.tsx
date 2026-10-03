export function AboutPage() {
  return (
    <article className="prose-tempo mx-auto max-w-2xl space-y-5 text-[15px] leading-relaxed text-foreground">
      <h2 className="text-2xl font-bold tracking-tight">Sobre o Tempo Foco</h2>
      <p className="text-muted-foreground">
        O Tempo Foco é um cronógrafo pessoal para registrar sessões de trabalho,
        estudo e foco. A ideia é simples: você descreve o que vai fazer, escolhe
        uma categoria, inicia o timer e acompanha quanto tempo realmente
        investiu — sem planilha e sem conta obrigatória.
      </p>

      <h3 className="text-lg font-semibold">Como usar</h3>
      <ol className="list-decimal space-y-2 pl-5 text-muted-foreground">
        <li>
          Em <strong className="text-foreground">Registros</strong>, escreva a
          descrição da sessão e selecione uma categoria.
        </li>
        <li>
          Toque no botão verde de play para iniciar. Pause quando precisar e
          continue depois — o tempo acumulado é preservado.
        </li>
        <li>
          O histórico agrupa sessões por dia (Hoje, Ontem, datas). Limpar o
          histórico só remove da lista de Registros; os dados permanecem na{" "}
          <strong className="text-foreground">Análise</strong>.
        </li>
        <li>
          Na Análise, filtre por período, categoria ou status para ver totais,
          distribuição e padrões de uso do tempo.
        </li>
      </ol>

      <h3 className="text-lg font-semibold">Por que acompanhar o tempo?</h3>
      <p className="text-muted-foreground">
        Medir sessões de foco ajuda a perceber quanto do dia vai para trabalho
        profundo, reuniões, estudo de idiomas ou tarefas pessoais. Com dados
        claros fica mais fácil ajustar rotina, proteger blocos de concentração e
        evitar a sensação de “trabalhei o dia todo sem progresso”.
      </p>
      <p className="text-muted-foreground">
        Técnicas como blocos de 25–50 minutos, pausas curtas e revisão semanal
        funcionam melhor quando há registro concreto. O Tempo Foco não substitui
        um método de produtividade: ele torna o método mensurável.
      </p>

      <h3 className="text-lg font-semibold">Privacidade dos seus dados</h3>
      <p className="text-muted-foreground">
        Por padrão, categorias e registros ficam no{" "}
        <strong className="text-foreground">localStorage</strong> do seu
        navegador. Não exigimos login para o uso básico. Leia a página de
        Privacidade para detalhes sobre cookies, anúncios e armazenamento.
      </p>
    </article>
  );
}

export function PrivacyPage() {
  return (
    <article className="prose-tempo mx-auto max-w-2xl space-y-5 text-[15px] leading-relaxed text-foreground">
      <h2 className="text-2xl font-bold tracking-tight">Privacidade</h2>
      <p className="text-muted-foreground">
        Esta política descreve como o Tempo Foco trata informações no uso do
        site. Última atualização: outubro de 2026.
      </p>

      <h3 className="text-lg font-semibold">Dados que você registra</h3>
      <p className="text-muted-foreground">
        Descrições de sessões, categorias, horários e durações são salvos
        localmente no navegador (localStorage), no dispositivo que você está
        usando. Esses dados não são enviados a um servidor nosso no modo atual
        (armazenamento local).
      </p>

      <h3 className="text-lg font-semibold">Anúncios (Google AdSense)</h3>
      <p className="text-muted-foreground">
        O site pode exibir anúncios do Google AdSense em telas que já tenham
        conteúdo útil (por exemplo, histórico ou análise com registros). O
        Google e parceiros podem usar cookies ou identificadores semelhantes
        para veicular e medir anúncios, conforme as políticas do Google. Você
        pode gerenciar preferências de anúncios em{" "}
        <a
          className="text-primary underline-offset-4 hover:underline"
          href="https://adssettings.google.com/"
          target="_blank"
          rel="noreferrer"
        >
          Configurações de anúncios do Google
        </a>
        .
      </p>

      <h3 className="text-lg font-semibold">Cookies e tecnologias similares</h3>
      <p className="text-muted-foreground">
        Além do armazenamento local do app (tema e registros), terceiros como o
        Google podem definir cookies relacionados a publicidade e medição
        quando anúncios são carregados. Bloqueadores de anúncio podem impedir
        essa carga.
      </p>

      <h3 className="text-lg font-semibold">Contato</h3>
      <p className="text-muted-foreground">
        Dúvidas sobre privacidade relacionadas a este site podem ser tratadas
        pelo responsável pela publicação do domínio Tempo Foco no Google
        AdSense / painel do projeto.
      </p>
    </article>
  );
}
