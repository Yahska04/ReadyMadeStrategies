import { buildTemplates } from "../../lib/templateScaffold";

export const straddleCode = buildTemplates({
  name: "Straddle",
  className: "StraddleStrategy",
  kind: "options",

  python: {
    config: `
UNDERLYING = {{UNDERLYING}}  # Underlying symbol as defined by the TradeSmart API
EXPIRY = {{EXPIRY}}  # Expiry in the format required by the TradeSmart API
STRIKE_SELECTION = {{STRIKE_SELECTION}}  # "ATM", "ATM+1" (one strike above), "ATM-1" (one strike below)
QUANTITY = {{QUANTITY}}  # Must be a valid multiple of the contract lot size
ENTRY_TIME = {{ENTRY_TIME}}  # HH:MM, exchange time
EXIT_TIME = {{EXIT_TIME}}  # HH:MM, exchange time
POSITION_SIDE = {{POSITION_SIDE}}  # "BUY" = long straddle, "SELL" = short straddle
UNDERLYING_EXCHANGE = "NSE"  # Placeholder exchange codes - confirm with the TradeSmart API
OPTIONS_EXCHANGE = "NFO"
STRIKE_STEP = 50  # Strike interval of the underlying's option chain
PRODUCT_TYPE = "MIS"  # Placeholder - use the product codes defined by the TradeSmart API
ORDER_TYPE = "MARKET"
`,
    logic: `
def select_strike(spot: float) -> float:
    """Round the spot price to the nearest strike, then apply the ATM offset."""
    atm = round(spot / STRIKE_STEP) * STRIKE_STEP
    offset = int(STRIKE_SELECTION[3:] or 0)  # "ATM+1" -> 1, "ATM-1" -> -1, "ATM" -> 0
    return atm + offset * STRIKE_STEP


def wait_until(hh_mm: str) -> None:
    target = datetime.strptime(hh_mm, "%H:%M").time()
    while datetime.now().time() < target:
        time.sleep(5)


def place_legs(client: TradeSmartClient, legs: list[str], side: str) -> None:
    for symbol in legs:
        client.place_order(OPTIONS_EXCHANGE, symbol, side, QUANTITY, ORDER_TYPE, PRODUCT_TYPE)


def run_strategy(client: TradeSmartClient) -> None:
    print(f"{POSITION_SIDE} straddle on {UNDERLYING} {EXPIRY} ({STRIKE_SELECTION}), {ENTRY_TIME}-{EXIT_TIME}")
    wait_until(ENTRY_TIME)

    spot = client.get_ltp(UNDERLYING_EXCHANGE, UNDERLYING)
    strike = select_strike(spot)
    legs = [
        client.get_option_symbol(UNDERLYING, EXPIRY, strike, "CE"),
        client.get_option_symbol(UNDERLYING, EXPIRY, strike, "PE"),
    ]
    print(f"Spot {spot:.2f} -> strike {strike}: {legs}")
    place_legs(client, legs, POSITION_SIDE)

    # TODO: add your own risk controls (e.g. combined stop loss) before relying on a time-based exit.
    wait_until(EXIT_TIME)
    place_legs(client, legs, "SELL" if POSITION_SIDE == "BUY" else "BUY")
    print("Straddle closed.")
`,
  },

  node: {
    config: `
const UNDERLYING = {{UNDERLYING}}; // Underlying symbol as defined by the TradeSmart API
const EXPIRY = {{EXPIRY}}; // Expiry in the format required by the TradeSmart API
const STRIKE_SELECTION = {{STRIKE_SELECTION}}; // "ATM", "ATM+1" (one strike above), "ATM-1" (one strike below)
const QUANTITY = {{QUANTITY}}; // Must be a valid multiple of the contract lot size
const ENTRY_TIME = {{ENTRY_TIME}}; // HH:MM, exchange time
const EXIT_TIME = {{EXIT_TIME}}; // HH:MM, exchange time
const POSITION_SIDE = {{POSITION_SIDE}}; // "BUY" = long straddle, "SELL" = short straddle
const UNDERLYING_EXCHANGE = "NSE"; // Placeholder exchange codes - confirm with the TradeSmart API
const OPTIONS_EXCHANGE = "NFO";
const STRIKE_STEP = 50; // Strike interval of the underlying's option chain
const PRODUCT_TYPE = "MIS"; // Placeholder - use the product codes defined by the TradeSmart API
const ORDER_TYPE = "MARKET";
`,
    logic: `
/** Round the spot price to the nearest strike, then apply the ATM offset. */
function selectStrike(spot) {
  const atm = Math.round(spot / STRIKE_STEP) * STRIKE_STEP;
  const offset = Number(STRIKE_SELECTION.slice(3) || 0); // "ATM+1" -> 1, "ATM-1" -> -1, "ATM" -> 0
  return atm + offset * STRIKE_STEP;
}

async function waitUntil(hhmm) {
  const [hours, minutes] = hhmm.split(":").map(Number);
  const targetMinutes = hours * 60 + minutes;
  while (true) {
    const now = new Date();
    if (now.getHours() * 60 + now.getMinutes() >= targetMinutes) return;
    await sleep(5000);
  }
}

async function placeLegs(client, legs, side) {
  for (const symbol of legs) {
    await client.placeOrder(OPTIONS_EXCHANGE, symbol, side, QUANTITY, ORDER_TYPE, PRODUCT_TYPE);
  }
}

async function runStrategy(client) {
  console.log(POSITION_SIDE + " straddle on " + UNDERLYING + " " + EXPIRY + " (" + STRIKE_SELECTION + "), " + ENTRY_TIME + "-" + EXIT_TIME);
  await waitUntil(ENTRY_TIME);

  const spot = await client.getLtp(UNDERLYING_EXCHANGE, UNDERLYING);
  const strike = selectStrike(spot);
  const legs = [
    await client.getOptionSymbol(UNDERLYING, EXPIRY, strike, "CE"),
    await client.getOptionSymbol(UNDERLYING, EXPIRY, strike, "PE"),
  ];
  console.log("Spot " + spot.toFixed(2) + " -> strike " + strike + ":", legs);
  await placeLegs(client, legs, POSITION_SIDE);

  // TODO: add your own risk controls (e.g. combined stop loss) before relying on a time-based exit.
  await waitUntil(EXIT_TIME);
  await placeLegs(client, legs, POSITION_SIDE === "BUY" ? "SELL" : "BUY");
  console.log("Straddle closed.");
}
`,
  },

  java: {
    config: `
    static final String UNDERLYING = {{UNDERLYING}}; // Underlying symbol as defined by the TradeSmart API
    static final String EXPIRY = {{EXPIRY}}; // Expiry in the format required by the TradeSmart API
    static final String STRIKE_SELECTION = {{STRIKE_SELECTION}}; // "ATM", "ATM+1" (one strike above), "ATM-1"
    static final int QUANTITY = {{QUANTITY}}; // Must be a valid multiple of the contract lot size
    static final String ENTRY_TIME = {{ENTRY_TIME}}; // HH:MM, exchange time
    static final String EXIT_TIME = {{EXIT_TIME}}; // HH:MM, exchange time
    static final String POSITION_SIDE = {{POSITION_SIDE}}; // "BUY" = long straddle, "SELL" = short straddle
    static final String UNDERLYING_EXCHANGE = "NSE"; // Placeholder exchange codes - confirm with the TradeSmart API
    static final String OPTIONS_EXCHANGE = "NFO";
    static final double STRIKE_STEP = 50; // Strike interval of the underlying's option chain
    static final String PRODUCT_TYPE = "MIS"; // Placeholder - use the product codes defined by the TradeSmart API
    static final String ORDER_TYPE = "MARKET";
`,
    logic: `
    /** Round the spot price to the nearest strike, then apply the ATM offset. */
    static double selectStrike(double spot) {
        double atm = Math.round(spot / STRIKE_STEP) * STRIKE_STEP;
        int offset = STRIKE_SELECTION.length() > 3 ? Integer.parseInt(STRIKE_SELECTION.substring(3)) : 0;
        return atm + offset * STRIKE_STEP;
    }

    static void waitUntil(String hhmm) throws InterruptedException {
        LocalTime target = LocalTime.parse(hhmm);
        while (LocalTime.now().isBefore(target)) Thread.sleep(5000);
    }

    static void placeLegs(TradeSmartClient client, List<String> legs, String side) {
        for (String symbol : legs) {
            client.placeOrder(OPTIONS_EXCHANGE, symbol, side, QUANTITY, ORDER_TYPE, PRODUCT_TYPE);
        }
    }

    static void runStrategy(TradeSmartClient client) throws InterruptedException {
        System.out.printf("%s straddle on %s %s (%s), %s-%s%n",
            POSITION_SIDE, UNDERLYING, EXPIRY, STRIKE_SELECTION, ENTRY_TIME, EXIT_TIME);
        waitUntil(ENTRY_TIME);

        double spot = client.getLtp(UNDERLYING_EXCHANGE, UNDERLYING);
        double strike = selectStrike(spot);
        List<String> legs = List.of(
            client.getOptionSymbol(UNDERLYING, EXPIRY, strike, "CE"),
            client.getOptionSymbol(UNDERLYING, EXPIRY, strike, "PE")
        );
        System.out.printf("Spot %.2f -> strike %.0f: %s%n", spot, strike, legs);
        placeLegs(client, legs, POSITION_SIDE);

        // TODO: add your own risk controls (e.g. combined stop loss) before relying on a time-based exit.
        waitUntil(EXIT_TIME);
        placeLegs(client, legs, POSITION_SIDE.equals("BUY") ? "SELL" : "BUY");
        System.out.println("Straddle closed.");
    }
`,
  },

  csharp: {
    config: `
    private const string Underlying = {{UNDERLYING}}; // Underlying symbol as defined by the TradeSmart API
    private const string Expiry = {{EXPIRY}}; // Expiry in the format required by the TradeSmart API
    private const string StrikeSelection = {{STRIKE_SELECTION}}; // "ATM", "ATM+1" (one strike above), "ATM-1"
    private const int Quantity = {{QUANTITY}}; // Must be a valid multiple of the contract lot size
    private const string EntryTime = {{ENTRY_TIME}}; // HH:MM, exchange time
    private const string ExitTime = {{EXIT_TIME}}; // HH:MM, exchange time
    private const string PositionSide = {{POSITION_SIDE}}; // "BUY" = long straddle, "SELL" = short straddle
    private const string UnderlyingExchange = "NSE"; // Placeholder exchange codes - confirm with the TradeSmart API
    private const string OptionsExchange = "NFO";
    private const double StrikeStep = 50; // Strike interval of the underlying's option chain
    private const string ProductType = "MIS"; // Placeholder - use the product codes defined by the TradeSmart API
    private const string OrderType = "MARKET";
`,
    logic: `
    /// <summary>Round the spot price to the nearest strike, then apply the ATM offset.</summary>
    private static double SelectStrike(double spot)
    {
        double atm = Math.Round(spot / StrikeStep, MidpointRounding.AwayFromZero) * StrikeStep;
        int offset = StrikeSelection.Length > 3 ? int.Parse(StrikeSelection[3..]) : 0;
        return atm + offset * StrikeStep;
    }

    private static void WaitUntil(string hhmm)
    {
        var target = TimeSpan.Parse(hhmm);
        while (DateTime.Now.TimeOfDay < target) Thread.Sleep(5000);
    }

    private static void PlaceLegs(TradeSmartClient client, IEnumerable<string> legs, string side)
    {
        foreach (var symbol in legs)
            client.PlaceOrder(OptionsExchange, symbol, side, Quantity, OrderType, ProductType);
    }

    private static void RunStrategy(TradeSmartClient client)
    {
        Console.WriteLine($"{PositionSide} straddle on {Underlying} {Expiry} ({StrikeSelection}), {EntryTime}-{ExitTime}");
        WaitUntil(EntryTime);

        double spot = client.GetLtp(UnderlyingExchange, Underlying);
        double strike = SelectStrike(spot);
        var legs = new List<string>
        {
            client.GetOptionSymbol(Underlying, Expiry, strike, "CE"),
            client.GetOptionSymbol(Underlying, Expiry, strike, "PE"),
        };
        Console.WriteLine($"Spot {spot:F2} -> strike {strike}: {string.Join(", ", legs)}");
        PlaceLegs(client, legs, PositionSide);

        // TODO: add your own risk controls (e.g. combined stop loss) before relying on a time-based exit.
        WaitUntil(ExitTime);
        PlaceLegs(client, legs, PositionSide == "BUY" ? "SELL" : "BUY");
        Console.WriteLine("Straddle closed.");
    }
`,
  },
});
