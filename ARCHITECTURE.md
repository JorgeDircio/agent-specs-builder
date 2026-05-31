# Agent Specs Builder — Arquitectura y Flujos

## Stack tecnológico

```mermaid
graph TD
    subgraph Client["Cliente (Navegador)"]
        UI["React + TypeScript + Tailwind CSS"]
        LS["localStorage\n(borradores, historial de sesión)"]
        UI <--> LS
    end

    subgraph Server["Servidor (Next.js 16 — API Routes → Vercel Edge Functions)"]
        AR["API Route\n/api/chat"]
        RL["Rate Limiting\n(middleware)"]
        ENV["Variables de entorno\n(ANTHROPIC_API_KEY)"]
        AR --> ENV
        RL --> AR
    end

    subgraph AI["Capa de IA"]
        SDK["Vercel AI SDK"]
        Claude["Anthropic Claude\n(claude-sonnet / claude-opus)"]
        SDK --> Claude
    end

    UI -- "POST (streaming)" --> RL
    AR -- "stream de tokens" --> UI
    AR --> SDK
```

---

## Flujo principal del usuario

```mermaid
sequenceDiagram
    actor U as Usuario
    participant App as Next.js App
    participant LS as localStorage
    participant API as API Route
    participant SDK as Vercel AI SDK
    participant C as Claude (Anthropic)

    U->>App: Describe su idea en lenguaje natural
    App->>LS: Guarda borrador (descripción)
    App->>API: POST /api/chat (descripción)
    API->>SDK: streamText(messages)
    SDK->>C: Prompt de clarificación
    C-->>SDK: Preguntas (streaming)
    SDK-->>API: Stream de tokens
    API-->>App: Server-Sent Events
    App-->>U: Muestra preguntas una a una

    loop Por cada pregunta
        U->>App: Responde en lenguaje natural
        App->>LS: Actualiza borrador (respuestas)
        App->>API: POST /api/chat (contexto acumulado)
        API->>SDK: streamText(messages)
        SDK->>C: Confirmar respuesta / siguiente pregunta
        C-->>SDK: Respuesta (streaming)
        SDK-->>API: Stream de tokens
        API-->>App: Server-Sent Events
        App-->>U: Muestra confirmación / siguiente pregunta
    end

    App->>U: Resumen para validar antes de generar
    U->>App: Confirma resumen
    App->>API: POST /api/chat (genera spec completa)
    API->>SDK: streamText(messages, systemPrompt de spec)
    SDK->>C: Genera documento técnico
    C-->>SDK: Spec (streaming)
    SDK-->>API: Stream de tokens
    API-->>App: Server-Sent Events
    App-->>U: Muestra spec sección por sección
    App->>LS: Guarda spec generada

    U->>App: Clic en "Exportar Markdown"
    App->>U: Descarga archivo .md
```

---

## Módulos del sistema

```mermaid
graph LR
    subgraph Input["Módulo de Entrada"]
        I1["Campo de descripción libre"]
        I2["Chat de clarificación"]
        I3["Selector de alcance\n(web / móvil / ambos)"]
    end

    subgraph State["Estado (localStorage)"]
        S1["Borrador activo"]
        S2["Historial de mensajes"]
        S3["Spec generada"]
        S4["Paso actual del flujo"]
    end

    subgraph Processing["Módulo de Procesamiento (API Routes)"]
        P1["Prompt de clarificación"]
        P2["Prompt de generación de spec"]
        P3["Rate limiter"]
    end

    subgraph Output["Módulo de Salida"]
        O1["Visualizador de spec\n(sección por sección)"]
        O2["Exportar Markdown (.md)"]
        O3["Indicador de progreso del flujo"]
    end

    Input --> State
    State --> Processing
    Processing --> Output
    Output --> State
```

---

## Estados del flujo

```mermaid
stateDiagram-v2
    [*] --> Descripción : Usuario abre la app

    Descripción --> Clarificación : Envía descripción
    Descripción --> Descripción : Descripción muy vaga\n(el agente pide ampliar)

    Clarificación --> Clarificación : Responde pregunta N
    Clarificación --> Validación : Todas las preguntas respondidas
    Clarificación --> Borrador : Usuario abandona\n(guardado automático en localStorage)

    Borrador --> Clarificación : Usuario retoma sesión

    Validación --> Generación : Usuario confirma resumen
    Validación --> Clarificación : Usuario corrige algún dato

    Generación --> Revisión : Spec generada (streaming completo)
    Generación --> Clarificación : Error de generación\n(respuestas preservadas en localStorage)

    Revisión --> Exportación : Usuario descarga .md
    Revisión --> Iteración : Usuario quiere ajustar

    Iteración --> Generación : Regenera sección o spec completa

    Exportación --> [*]
```

---

## Estructura de carpetas (Next.js 16)

```
agent-specs-builder/
├── app/
│   ├── page.tsx               # Pantalla principal (chat + spec)
│   ├── layout.tsx
│   └── api/
│       └── chat/
│           └── route.ts       # API Route con Vercel AI SDK + Claude
├── components/
│   ├── ChatInput.tsx          # Campo de descripción + respuestas
│   ├── ChatMessages.tsx       # Historial de mensajes con streaming
│   ├── SpecViewer.tsx         # Visualizador de spec por secciones
│   ├── ProgressIndicator.tsx  # Barra de progreso del flujo
│   └── ExportButton.tsx       # Descarga .md
├── lib/
│   ├── prompts.ts             # System prompts para Claude
│   ├── storage.ts             # Helpers de localStorage
│   └── export.ts              # Generación del archivo Markdown
├── hooks/
│   └── useSpecSession.ts      # Estado global de la sesión
└── .env.local                 # ANTHROPIC_API_KEY (nunca al cliente)
```

---

## Notas de implementación

| Decisión | Detalle |
|---|---|
| Proveedor de IA | Anthropic Claude via Vercel AI SDK (`@ai-sdk/anthropic`) |
| Streaming | `streamText()` del AI SDK → Server-Sent Events al cliente |
| Persistencia | `localStorage` únicamente — sin base de datos en V1 |
| Exportación | Solo Markdown (`.md`) generado en el cliente |
| API Key | Solo en variables de entorno del servidor (`ANTHROPIC_API_KEY`) |
| Rate limiting | Middleware de Next.js en `/api/chat` |
| Despliegue | Vercel (zero-config para Next.js + Edge Functions) |

> **Nota sobre la suscripción Pro de Anthropic:** La API de Claude requiere créditos de API separados de la suscripción Claude.ai Pro. Para el desarrollo puedes usar la API con pago por uso; la suscripción Pro no cubre llamadas de API directas.
