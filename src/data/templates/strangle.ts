import { buildTemplates } from "../../lib/templateScaffold";

export const strangleCode = buildTemplates({
  name: "Strangle",
  className: "StrangleStrategy",
  kind: "options",

  python: {
    config: `
UNDERLYING = {{UNDERLYING}}  # Underlying symbol as defined by the TradeSmart API
EXPIRY = {{EXPIRY}}  # Expiry in the format required by the TradeSmart API
CALL_STRIKE_OFFSET = {{CALL_STRIKE_OFFSET}}  # Points above ATM for the call leg
PUT_STRIKE_OFFSET = {{PUT_STRIKE_OFFSET}}  # Points below ATM for the put leg
QUANTITY = {{QUANTITY}}  # Must be a valid multiple of the contract lot size
ENTRY_TIME = {{ENTRY_TIME}}  # HH:MM, exchange time
EXIT_TIME = {{EXIT_TIME}}  # HH:MM, exchange time
POSITION_SIDE = {{POSITION_SIDE}}  # "BUY" = long strangle, "SELL" = short strangle
UNDERLYING_EXCHANGE = "NSE"  # Placeholder exchange codes - confirm with the TradeSmart API
OPTIONS_EXCHANGE = "NFO"
STRIKE_STEP = 50  # Strike interval of the underlying's option chain
PRODUCT_TYPE = "MIS"  # Placeholder - use the product codes defined by the TradeSmart API
ORDER_TYPE = "MARKET"
`,
    logic: `
def round_to_strike(price: float) -> float:
    return round(price / STRIKE_STEP) * STRIKE_STEP


def select_strikes(spot: float) -> tuple[float, float]:
    """Return (call_strike, put_strike) around the at-the-money strike."""
    atm = round_to_strike(spot)
    return round_to_strike(atm + CALL_STRIKE_OFFSET), round_to_strike(atm - PUT_STRIKE_OFFSET)


def wait_until(hh_mm: str) -> None:
    target = datetime.strptime(hh_mm, "%H:%M").time()
    while datetime.now().time() < target:
        time.sleep(5)


def place_legs(client: TradeSmartClient, legs: list[str], side: str) -> None:
    for symbol in legs:
        client.place_order(OPTIONS_EXCHANGE, symbol, side, QUANTITY, ORDER_TYPE, PRODUCT_TYPE)


def run_strategy(client: TradeSmartClient) -> None:
    print(f"{POSITION_SIDE} strangle on {UNDERLYING} {EXPIRY}, {ENTRY_TIME}-{EXIT_TIME}")
    wait_until(ENTRY_TIME)

    spot = client.get_ltp(UNDERLYING_EXCHANGE, UNDERLYING)
    call_strike, put_strike = select_strikes(spot)
    legs = [
        client.get_option_symbol(UNDERLYING, EXPIRY, call_strike, "CE"),
        client.get_option_symbol(UNDERLYING, EXPIRY, put_strike, "PE"),
    ]
    print(f"Spot {spot:.2f} -> call {call_strike} / put {put_strike}: {legs}")
    place_legs(client, legs, POSITION_SIDE)

    # TODO: add your own risk controls (e.g. combined stop loss) before relying on a time-based exit.
    wait_until(EXIT_TIME)
    place_legs(client, legs, "SELL" if POSITION_SIDE == "BUY" else "BUY")
    print("Strangle closed.")
`,
  },

  node: {
    config: `
const UNDERLYING = {{UNDERLYING}}; // Underlying symbol as defined by the TradeSmart API
const EXPIRY = {{EXPIRY}}; // Expiry in the format required by the TradeSmart API
const CALL_STRIKE_OFFSET = {{CALL_STRIKE_OFFSET}}; // Points above ATM for the call leg
const PUT_STRIKE_OFFSET = {{PUT_STRIKE_OFFSET}}; // Points below ATM for the put leg
const QUANTITY = {{QUANTITY}}; // Must be a valid multiple of the contract lot size
const ENTRY_TIME = {{ENTRY_TIME}}; // HH:MM, exchange time
const EXIT_TIME = {{EXIT_TIME}}; // HH:MM, exchange time
const POSITION_SIDE = {{POSITION_SIDE}}; // "BUY" = long strangle, "SELL" = short strangle
const UNDERLYING_EXCHANGE = "NSE"; // Placeholder exchange codes - confirm with the TradeSmart API
const OPTIONS_EXCHANGE = "NFO";
const STRIKE_STEP = 50; // Strike interval of the underlying's option chain
const PRODUCT_TYPE = "MIS"; // Placeholder - use the product codes defined by the TradeSmart API
const ORDER_TYPE = "MARKET";
`,
    logic: `
const roundToStrike = (price) => Math.round(price / STRIKE_STEP) * STRIKE_STEP;

/** Return [callStrike, putStrike] around the at-the-money strike. */
function selectStrikes(spot) {
  const atm = roundToStrike(spot);
  return [roundToStrike(atm + CALL_STRIKE_OFFSET), roundToStrike(atm - PUT_STRIKE_OFFSET)];
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
  console.log(POSITION_SIDE + " strangle on " + UNDERLYING + " " + EXPIRY + ", " + ENTRY_TIME + "-" + EXIT_TIME);
  await waitUntil(ENTRY_TIME);

  const spot = await client.getLtp(UNDERLYING_EXCHANGE, UNDERLYING);
  const [callStrike, putStrike] = selectStrikes(spot);
  const legs = [
    await client.getOptionSymbol(UNDERLYING, EXPIRY, callStrike, "CE"),
    await client.getOptionSymbol(UNDERLYING, EXPIRY, putStrike, "PE"),
  ];
  console.log("Spot " + spot.toFixed(2) + " -> call " + callStrike + " / put " + putStrike + ":", legs);
  await placeLegs(client, legs, POSITION_SIDE);

  // TODO: add your own risk controls (e.g. combined stop loss) before relying on a time-based exit.
  await waitUntil(EXIT_TIME);
  await placeLegs(client, legs, POSITION_SIDE === "BUY" ? "SELL" : "BUY");
  console.log("Strangle closed.");
}
`,
  },

  java: {
    config: `
    static final String UNDERLYING = {{UNDERLYING}}; // Underlying symbol as defined by the TradeSmart API
    static final String EXPIRY = {{EXPIRY}}; // Expiry in the format required by the TradeSmart API
    static final double CALL_STRIKE_OFFSET = {{CALL_STRIKE_OFFSET}}; // Points above ATM for the call leg
    static final double PUT_STRIKE_OFFSET = {{PUT_STRIKE_OFFSET}}; // Points below ATM for the put leg
    static final int QUANTITY = {{QUANTITY}}; // Must be a valid multiple of the contract lot size
    static final String ENTRY_TIME = {{ENTRY_TIME}}; // HH:MM, exchange time
    static final String EXIT_TIME = {{EXIT_TIME}}; // HH:MM, exchange time
    static final String POSITION_SIDE = {{POSITION_SIDE}}; // "BUY" = long strangle, "SELL" = short strangle
    static final String UNDERLYING_EXCHANGE = "NSE"; // Placeholder exchange codes - confirm with the TradeSmart API
    static final String OPTIONS_EXCHANGE = "NFO";
    static final double STRIKE_STEP = 50; // Strike interval of the underlying's option chain
    static final String PRODUCT_TYPE = "MIS"; // Placeholder - use the product codes defined by the TradeSmart API
    static final String ORDER_TYPE = "MARKET";
`,
    logic: `
    static double roundToStrike(double price) {
        return Math.round(price / STRIKE_STEP) * STRIKE_STEP;
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
        System.out.printf("%s strangle on %s %s, %s-%s%n", POSITION_SIDE, UNDERLYING, EXPIRY, ENTRY_TIME, EXIT_TIME);
        waitUntil(ENTRY_TIME);

        double spot = client.getLtp(UNDERLYING_EXCHANGE, UNDERLYING);
        double atm = roundToStrike(spot);
        double callStrike = roundToStrike(atm + CALL_STRIKE_OFFSET);
        double putStrike = roundToStrike(atm - PUT_STRIKE_OFFSET);
        List<String> legs = List.of(
            client.getOptionSymbol(UNDERLYING, EXPIRY, callStrike, "CE"),
            client.getOptionSymbol(UNDERLYING, EXPIRY, putStrike, "PE")
        );
        System.out.printf("Spot %.2f -> call %.0f / put %.0f: %s%n", spot, callStrike, putStrike, legs);
        placeLegs(client, legs, POSITION_SIDE);

        // TODO: add your own risk controls (e.g. combined stop loss) before relying on a time-based exit.
        waitUntil(EXIT_TIME);
        placeLegs(client, legs, POSITION_SIDE.equals("BUY") ? "SELL" : "BUY");
        System.out.println("Strangle closed.");
    }
`,
  },

  csharp: {
    config: `
    private const string Underlying = {{UNDERLYING}}; // Underlying symbol as defined by the TradeSmart API
    private const string Expiry = {{EXPIRY}}; // Expiry in the format required by the TradeSmart API
    private const double CallStrikeOffset = {{CALL_STRIKE_OFFSET}}; // Points above ATM for the call leg
    private const double PutStrikeOffset = {{PUT_STRIKE_OFFSET}}; // Points below ATM for the put leg
    private const int Quantity = {{QUANTITY}}; // Must be a valid multiple of the contract lot size
    private const string EntryTime = {{ENTRY_TIME}}; // HH:MM, exchange time
    private const string ExitTime = {{EXIT_TIME}}; // HH:MM, exchange time
    private const string PositionSide = {{POSITION_SIDE}}; // "BUY" = long strangle, "SELL" = short strangle
    private const string UnderlyingExchange = "NSE"; // Placeholder exchange codes - confirm with the TradeSmart API
    private const string OptionsExchange = "NFO";
    private const double StrikeStep = 50; // Strike interval of the underlying's option chain
    private const string ProductType = "MIS"; // Placeholder - use the product codes defined by the TradeSmart API
    private const string OrderType = "MARKET";
`,
    logic: `
    private static double RoundToStrike(double price) =>
        Math.Round(price / StrikeStep, MidpointRounding.AwayFromZero) * StrikeStep;

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
        Console.WriteLine($"{PositionSide} strangle on {Underlying} {Expiry}, {EntryTime}-{ExitTime}");
        WaitUntil(EntryTime);

        double spot = client.GetLtp(UnderlyingExchange, Underlying);
        double atm = RoundToStrike(spot);
        double callStrike = RoundToStrike(atm + CallStrikeOffset);
        double putStrike = RoundToStrike(atm - PutStrikeOffset);
        var legs = new List<string>
        {
            client.GetOptionSymbol(Underlying, Expiry, callStrike, "CE"),
            client.GetOptionSymbol(Underlying, Expiry, putStrike, "PE"),
        };
        Console.WriteLine($"Spot {spot:F2} -> call {callStrike} / put {putStrike}: {string.Join(", ", legs)}");
        PlaceLegs(client, legs, PositionSide);

        // TODO: add your own risk controls (e.g. combined stop loss) before relying on a time-based exit.
        WaitUntil(ExitTime);
        PlaceLegs(client, legs, PositionSide == "BUY" ? "SELL" : "BUY");
        Console.WriteLine("Strangle closed.");
    }
`,
  },
});
