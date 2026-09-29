import type { LanguageKey } from "../types/strategy";

/**
 * Builds complete, self-contained template files for every language.
 *
 * Each strategy only supplies its parameter block ("config") and its
 * strategy logic ("logic"). This scaffold wraps them with:
 *   - a header that clearly states the file is an unofficial template,
 *   - a PLACEHOLDER TradeSmartClient whose methods throw until they are wired
 *     to the official TradeSmart API (no real endpoints are assumed),
 *   - a DRY_RUN paper-position mode so the order flow can be exercised safely,
 *   - an entry point that reads credentials from environment variables.
 *
 * `{{DOCS_URL}}` and `{{PARAMETER_KEY}}` placeholders are substituted later.
 */

export interface LanguageSource {
  config: string;
  logic: string;
}

export interface TemplateSpec {
  name: string;
  /** Class name used for Java / C# files, e.g. EmaCrossoverStrategy. */
  className: string;
  /** Equity strategies poll candles; options strategies resolve contracts. */
  kind: "equity" | "options";
  python: LanguageSource;
  node: LanguageSource;
  java: LanguageSource;
  csharp: LanguageSource;
}

const LANGUAGE_LABEL: Record<LanguageKey, string> = {
  python: "Python 3.10+",
  node: "Node.js 18+",
  java: "Java 17+",
  csharp: "C# / .NET 6+",
};

function headerLines(spec: TemplateSpec, lang: LanguageKey): string[] {
  return [
    `TradeSmart API - ${spec.name} Strategy Template (${LANGUAGE_LABEL[lang]})`,
    "",
    "EDUCATIONAL DEVELOPMENT TEMPLATE - NOT AN OFFICIAL TRADESMART SDK.",
    "The TradeSmartClient class in this file contains PLACEHOLDER methods.",
    "Their names and signatures are illustrative only. Replace each method",
    "body with the matching call from the official TradeSmart API docs:",
    "  {{DOCS_URL}}",
    "",
    "These templates are provided as development examples. Independently test",
    "and validate the strategy logic before deploying it in live markets.",
    "Nothing in this file is investment advice.",
  ];
}

const trimBlock = (block: string) => block.replace(/^\n+|\s+$/g, "");

/* ------------------------------------------------------------------------ */
/* Python                                                                   */
/* ------------------------------------------------------------------------ */

function buildPython(spec: TemplateSpec): string {
  const equity = spec.kind === "equity";
  const header = headerLines(spec, "python").join("\n");

  const marketDataMethods = equity
    ? `
    def get_candles(self, exchange: str, symbol: str, interval: str, count: int) -> list[Candle]:
        """Return the latest \`count\` OHLCV candles, oldest first."""
        # TODO: call the TradeSmart market data API and map the response to Candle objects.
        raise NotImplementedError("Connect get_candles() to the TradeSmart market data API")
`
    : `
    def get_option_symbol(self, underlying: str, expiry: str, strike: float, option_type: str) -> str:
        """Resolve the tradable option contract symbol. option_type is "CE" or "PE"."""
        # TODO: look up the contract using TradeSmart instrument / master data.
        raise NotImplementedError("Connect get_option_symbol() to the TradeSmart instrument data")
`;

  const positionMethod = equity
    ? `
    def get_net_quantity(self, exchange: str, symbol: str) -> int:
        """Return the current net position quantity (0 when flat)."""
        if self.dry_run:
            return self._paper_positions.get(f"{exchange}:{symbol}", 0)
        # TODO: read the net quantity from the TradeSmart positions API.
        raise NotImplementedError("Connect get_net_quantity() to the TradeSmart positions API")
`
    : "";

  return `"""
${header}
"""
import os
import time
from dataclasses import dataclass
from datetime import datetime

# ---------------------------------------------------------------------------
# Strategy parameters
# ---------------------------------------------------------------------------
${trimBlock(spec.python.config)}

DRY_RUN = True  # When True, orders are only logged (paper positions are tracked locally).
${equity ? "POLL_SECONDS = 60  # How often the strategy loop runs.\n" : ""}

# ---------------------------------------------------------------------------
# PLACEHOLDER API client - replace method bodies with official TradeSmart calls
# ---------------------------------------------------------------------------
@dataclass
class Candle:
    timestamp: datetime
    open: float
    high: float
    low: float
    close: float
    volume: float


class TradeSmartClient:
    """Placeholder client. These methods are NOT official TradeSmart API methods."""

    def __init__(self, api_key: str, api_secret: str, dry_run: bool = True):
        self.api_key = api_key
        self.api_secret = api_secret
        self.dry_run = dry_run
        self._paper_positions: dict[str, int] = {}
        # TODO: authenticate / create a session as described in the TradeSmart API docs.
${marketDataMethods}
    def get_ltp(self, exchange: str, symbol: str) -> float:
        """Return the last traded price."""
        # TODO: call the TradeSmart market data API.
        raise NotImplementedError("Connect get_ltp() to the TradeSmart market data API")
${positionMethod}
    def place_order(self, exchange: str, symbol: str, side: str, quantity: int,
                    order_type: str, product_type: str) -> str:
        """Place an order and return its order id. side is "BUY" or "SELL"."""
        if self.dry_run:
            key = f"{exchange}:{symbol}"
            delta = quantity if side == "BUY" else -quantity
            self._paper_positions[key] = self._paper_positions.get(key, 0) + delta
            print(f"[DRY RUN] {side} {quantity} {key} ({order_type}/{product_type})")
            return "DRY-RUN"
        # TODO: place the order using the TradeSmart order management API.
        raise NotImplementedError("Connect place_order() to the TradeSmart order API")


# ---------------------------------------------------------------------------
# Strategy logic
# ---------------------------------------------------------------------------
${trimBlock(spec.python.logic)}


if __name__ == "__main__":
    # Never hard-code credentials - read them from environment variables.
    client = TradeSmartClient(
        api_key=os.getenv("TRADESMART_API_KEY", ""),
        api_secret=os.getenv("TRADESMART_API_SECRET", ""),
        dry_run=DRY_RUN,
    )
    run_strategy(client)
`;
}

/* ------------------------------------------------------------------------ */
/* Node.js                                                                  */
/* ------------------------------------------------------------------------ */

function buildNode(spec: TemplateSpec): string {
  const equity = spec.kind === "equity";
  const header = headerLines(spec, "node")
    .map((line) => (line ? ` * ${line}` : " *"))
    .join("\n");

  const marketDataMethods = equity
    ? `
  /**
   * Return the latest \`count\` OHLCV candles, oldest first.
   * @returns {Promise<Array<{timestamp: Date, open: number, high: number, low: number, close: number, volume: number}>>}
   */
  async getCandles(exchange, symbol, interval, count) {
    // TODO: call the TradeSmart market data API and map the response.
    throw new Error("TODO: connect getCandles() to the TradeSmart market data API");
  }
`
    : `
  /** Resolve the tradable option contract symbol. optionType is "CE" or "PE". */
  async getOptionSymbol(underlying, expiry, strike, optionType) {
    // TODO: look up the contract using TradeSmart instrument / master data.
    throw new Error("TODO: connect getOptionSymbol() to the TradeSmart instrument data");
  }
`;

  const positionMethod = equity
    ? `
  /** Return the current net position quantity (0 when flat). */
  async getNetQuantity(exchange, symbol) {
    if (this.dryRun) return this.paperPositions.get(exchange + ":" + symbol) || 0;
    // TODO: read the net quantity from the TradeSmart positions API.
    throw new Error("TODO: connect getNetQuantity() to the TradeSmart positions API");
  }
`
    : "";

  return `/**
${header}
 */
"use strict";

// ---------------------------------------------------------------------------
// Strategy parameters
// ---------------------------------------------------------------------------
${trimBlock(spec.node.config)}

const DRY_RUN = true; // When true, orders are only logged (paper positions are tracked locally).
${equity ? "const POLL_SECONDS = 60; // How often the strategy loop runs.\n" : ""}
// ---------------------------------------------------------------------------
// PLACEHOLDER API client - replace method bodies with official TradeSmart calls
// ---------------------------------------------------------------------------
class TradeSmartClient {
  /** Placeholder client. These methods are NOT official TradeSmart API methods. */
  constructor(apiKey, apiSecret, dryRun = true) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.dryRun = dryRun;
    this.paperPositions = new Map();
    // TODO: authenticate / create a session as described in the TradeSmart API docs.
  }
${marketDataMethods}
  /** Return the last traded price. */
  async getLtp(exchange, symbol) {
    // TODO: call the TradeSmart market data API.
    throw new Error("TODO: connect getLtp() to the TradeSmart market data API");
  }
${positionMethod}
  /** Place an order and return its order id. side is "BUY" or "SELL". */
  async placeOrder(exchange, symbol, side, quantity, orderType, productType) {
    if (this.dryRun) {
      const key = exchange + ":" + symbol;
      const delta = side === "BUY" ? quantity : -quantity;
      this.paperPositions.set(key, (this.paperPositions.get(key) || 0) + delta);
      console.log("[DRY RUN]", side, quantity, key, "(" + orderType + "/" + productType + ")");
      return "DRY-RUN";
    }
    // TODO: place the order using the TradeSmart order management API.
    throw new Error("TODO: connect placeOrder() to the TradeSmart order API");
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ---------------------------------------------------------------------------
// Strategy logic
// ---------------------------------------------------------------------------
${trimBlock(spec.node.logic)}

// Never hard-code credentials - read them from environment variables.
const client = new TradeSmartClient(
  process.env.TRADESMART_API_KEY || "",
  process.env.TRADESMART_API_SECRET || "",
  DRY_RUN
);

runStrategy(client).catch((error) => {
  console.error(error);
  process.exit(1);
});
`;
}

/* ------------------------------------------------------------------------ */
/* Java                                                                     */
/* ------------------------------------------------------------------------ */

function buildJava(spec: TemplateSpec): string {
  const equity = spec.kind === "equity";
  const header = headerLines(spec, "java")
    .map((line) => (line ? ` * ${line}` : " *"))
    .join("\n");

  const marketDataMethods = equity
    ? `
        /** Return the latest {@code count} OHLCV candles, oldest first. */
        List<Candle> getCandles(String exchange, String symbol, String interval, int count) {
            // TODO: call the TradeSmart market data API and map the response to Candle records.
            throw new UnsupportedOperationException("Connect getCandles() to the TradeSmart market data API");
        }
`
    : `
        /** Resolve the tradable option contract symbol. optionType is "CE" or "PE". */
        String getOptionSymbol(String underlying, String expiry, double strike, String optionType) {
            // TODO: look up the contract using TradeSmart instrument / master data.
            throw new UnsupportedOperationException("Connect getOptionSymbol() to the TradeSmart instrument data");
        }
`;

  const positionMethod = equity
    ? `
        /** Return the current net position quantity (0 when flat). */
        int getNetQuantity(String exchange, String symbol) {
            if (dryRun) return paperPositions.getOrDefault(exchange + ":" + symbol, 0);
            // TODO: read the net quantity from the TradeSmart positions API.
            throw new UnsupportedOperationException("Connect getNetQuantity() to the TradeSmart positions API");
        }
`
    : "";

  return `/*
${header}
 */
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;

public class ${spec.className} {

    // ---------------------------------------------------------------------
    // Strategy parameters
    // ---------------------------------------------------------------------
${trimBlock(spec.java.config)}

    static final boolean DRY_RUN = true; // When true, orders are only logged.
${equity ? "    static final int POLL_SECONDS = 60; // How often the strategy loop runs.\n" : ""}
    // ---------------------------------------------------------------------
    // PLACEHOLDER API client - replace method bodies with official TradeSmart calls
    // ---------------------------------------------------------------------
    record Candle(LocalDateTime timestamp, double open, double high, double low, double close, double volume) {}

    /** Placeholder client. These methods are NOT official TradeSmart API methods. */
    static class TradeSmartClient {
        private final String apiKey;
        private final String apiSecret;
        private final boolean dryRun;
        private final Map<String, Integer> paperPositions = new HashMap<>();

        TradeSmartClient(String apiKey, String apiSecret, boolean dryRun) {
            this.apiKey = apiKey;
            this.apiSecret = apiSecret;
            this.dryRun = dryRun;
            // TODO: authenticate / create a session as described in the TradeSmart API docs.
        }
${marketDataMethods}
        /** Return the last traded price. */
        double getLtp(String exchange, String symbol) {
            // TODO: call the TradeSmart market data API.
            throw new UnsupportedOperationException("Connect getLtp() to the TradeSmart market data API");
        }
${positionMethod}
        /** Place an order and return its order id. side is "BUY" or "SELL". */
        String placeOrder(String exchange, String symbol, String side, int quantity,
                          String orderType, String productType) {
            if (dryRun) {
                String key = exchange + ":" + symbol;
                int delta = side.equals("BUY") ? quantity : -quantity;
                paperPositions.merge(key, delta, Integer::sum);
                System.out.printf("[DRY RUN] %s %d %s (%s/%s)%n", side, quantity, key, orderType, productType);
                return "DRY-RUN";
            }
            // TODO: place the order using the TradeSmart order management API.
            throw new UnsupportedOperationException("Connect placeOrder() to the TradeSmart order API");
        }
    }

    // ---------------------------------------------------------------------
    // Strategy logic
    // ---------------------------------------------------------------------
${trimBlock(spec.java.logic)}

    public static void main(String[] args) throws InterruptedException {
        // Never hard-code credentials - read them from environment variables.
        TradeSmartClient client = new TradeSmartClient(
            Objects.requireNonNullElse(System.getenv("TRADESMART_API_KEY"), ""),
            Objects.requireNonNullElse(System.getenv("TRADESMART_API_SECRET"), ""),
            DRY_RUN
        );
        runStrategy(client);
    }
}
`;
}

/* ------------------------------------------------------------------------ */
/* C#                                                                       */
/* ------------------------------------------------------------------------ */

function buildCsharp(spec: TemplateSpec): string {
  const equity = spec.kind === "equity";
  const header = headerLines(spec, "csharp")
    .map((line) => (line ? `// ${line}` : "//"))
    .join("\n");

  const marketDataMethods = equity
    ? `
    /// <summary>Return the latest <paramref name="count"/> OHLCV candles, oldest first.</summary>
    public List<Candle> GetCandles(string exchange, string symbol, string interval, int count)
    {
        // TODO: call the TradeSmart market data API and map the response to Candle records.
        throw new NotImplementedException("Connect GetCandles() to the TradeSmart market data API");
    }
`
    : `
    /// <summary>Resolve the tradable option contract symbol. optionType is "CE" or "PE".</summary>
    public string GetOptionSymbol(string underlying, string expiry, double strike, string optionType)
    {
        // TODO: look up the contract using TradeSmart instrument / master data.
        throw new NotImplementedException("Connect GetOptionSymbol() to the TradeSmart instrument data");
    }
`;

  const positionMethod = equity
    ? `
    /// <summary>Return the current net position quantity (0 when flat).</summary>
    public int GetNetQuantity(string exchange, string symbol)
    {
        if (_dryRun) return _paperPositions.GetValueOrDefault($"{exchange}:{symbol}", 0);
        // TODO: read the net quantity from the TradeSmart positions API.
        throw new NotImplementedException("Connect GetNetQuantity() to the TradeSmart positions API");
    }
`
    : "";

  return `${header}
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;

namespace TradeSmartTemplates;

// -------------------------------------------------------------------------
// PLACEHOLDER API client - replace method bodies with official TradeSmart calls
// -------------------------------------------------------------------------
public record Candle(DateTime Timestamp, double Open, double High, double Low, double Close, double Volume);

/// <summary>Placeholder client. These methods are NOT official TradeSmart API methods.</summary>
public class TradeSmartClient
{
    private readonly string _apiKey;
    private readonly string _apiSecret;
    private readonly bool _dryRun;
    private readonly Dictionary<string, int> _paperPositions = new();

    public TradeSmartClient(string apiKey, string apiSecret, bool dryRun)
    {
        _apiKey = apiKey;
        _apiSecret = apiSecret;
        _dryRun = dryRun;
        // TODO: authenticate / create a session as described in the TradeSmart API docs.
    }
${marketDataMethods}
    /// <summary>Return the last traded price.</summary>
    public double GetLtp(string exchange, string symbol)
    {
        // TODO: call the TradeSmart market data API.
        throw new NotImplementedException("Connect GetLtp() to the TradeSmart market data API");
    }
${positionMethod}
    /// <summary>Place an order and return its order id. side is "BUY" or "SELL".</summary>
    public string PlaceOrder(string exchange, string symbol, string side, int quantity,
                             string orderType, string productType)
    {
        if (_dryRun)
        {
            var key = $"{exchange}:{symbol}";
            var delta = side == "BUY" ? quantity : -quantity;
            _paperPositions[key] = _paperPositions.GetValueOrDefault(key, 0) + delta;
            Console.WriteLine($"[DRY RUN] {side} {quantity} {key} ({orderType}/{productType})");
            return "DRY-RUN";
        }
        // TODO: place the order using the TradeSmart order management API.
        throw new NotImplementedException("Connect PlaceOrder() to the TradeSmart order API");
    }
}

public static class ${spec.className}
{
    // ---------------------------------------------------------------------
    // Strategy parameters
    // ---------------------------------------------------------------------
${trimBlock(spec.csharp.config)}

    private const bool DryRun = true; // When true, orders are only logged.
${equity ? "    private const int PollSeconds = 60; // How often the strategy loop runs.\n" : ""}
    // ---------------------------------------------------------------------
    // Strategy logic
    // ---------------------------------------------------------------------
${trimBlock(spec.csharp.logic)}

    public static void Main()
    {
        // Never hard-code credentials - read them from environment variables.
        var client = new TradeSmartClient(
            Environment.GetEnvironmentVariable("TRADESMART_API_KEY") ?? "",
            Environment.GetEnvironmentVariable("TRADESMART_API_SECRET") ?? "",
            DryRun);
        RunStrategy(client);
    }
}
`;
}

export function buildTemplates(spec: TemplateSpec): Record<LanguageKey, string> {
  return {
    python: buildPython(spec),
    node: buildNode(spec),
    java: buildJava(spec),
    csharp: buildCsharp(spec),
  };
}
