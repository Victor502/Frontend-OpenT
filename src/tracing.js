import { Resource } from "@opentelemetry/resources";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";
import {
  WebTracerProvider,
  SimpleSpanProcessor,
  ConsoleSpanExporter,
} from "@opentelemetry/sdk-trace-web";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { FetchInstrumentation } from "@opentelemetry/instrumentation-fetch";
import { B3Propagator, B3InjectEncoding } from "@opentelemetry/propagator-b3";
import { ZoneContextManager } from "@opentelemetry/context-zone";

const consoleExporter = new ConsoleSpanExporter();
const collectorExporter = new OTLPTraceExporter({
  url: "https://collector.dev.icanbwell.com/v1/traces", // where we want the spans to go must end in /v1/traces
});

const provider = new WebTracerProvider({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: "bWell.demo", // process.env.REACT_APP_NAME,
  }),
});

const fetchInstrumentation = new FetchInstrumentation({});
fetchInstrumentation.setTracerProvider(provider);
provider.addSpanProcessor(new SimpleSpanProcessor(consoleExporter)); // comment out to stop sending spans to console
provider.addSpanProcessor(new SimpleSpanProcessor(collectorExporter));
provider.register({
  contextManager: new ZoneContextManager(),
  propagator: new B3Propagator({
    injectEncoding: B3InjectEncoding.MULTI_HEADER,
  }),
});

registerInstrumentations({
  instrumentations: [fetchInstrumentation],
  tracerProvider: provider,
});


export function TraceProvider({ children }) {
  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{children}</>;
}
