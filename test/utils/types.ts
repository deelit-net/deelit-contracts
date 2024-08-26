export const OfferTypedData = {
    Offer: [
      { name: "from_address", type: "address" },
      { name: "product_hash", type: "bytes32" },
      { name: "price", type: "uint256" },
      { name: "currency_code", type: "string" },
      { name: "chain_id", type: "uint256" },
      { name: "token_address", type: "address" },
      { name: "shipment_hash", type: "bytes32" },
      { name: "shipment_price", type: "uint256" },
      { name: "expiration_time", type: "uint256" },
    ],
  }

export const PaymentTypedData = {
    Payment: [
      { name: "from_address", type: "address" },
      { name: "destination_address", type: "bytes" },
      { name: "offer_hash", type: "bytes32" },
      { name: "expiration_time", type: "uint256" },
      { name: "vesting_period", type: "uint256" },
    ],
  }

  export const AcceptanceTypedData = {
    Acceptance: [
      { name: "from_address", type: "address" },
      { name: "payment_hash", type: "bytes32" },
    ],
  }

  export const ConflictTypedData = {
    Conflict: [
      { name: "from_address", type: "address" },
      { name: "payment_hash", type: "bytes32" },
    ],
  }

  export const VerdictTypedData = {
    Verdict: [
      { name: 'from_address', type: 'address' },
      { name: 'payment_hash', type: 'bytes32' },
      { name: 'payer_bp', type: 'uint16' },
      { name: 'payee_bp', type: 'uint16' }
    ]
  }

  export const LotteryTypedData = {
    Lottery: [
      { name: 'from_address', type: 'address' },
      { name: 'product_hash', type: 'bytes32' },
      { name: 'nb_tickets', type: 'uint256' },
      { name: 'ticket_price', type: 'uint256' },
      { name: 'token_address', type: 'address' },
      { name: 'fee', type: 'Fee' },
      { name: 'protocol_fee', type: 'Fee' },
      { name: 'expiration_time', type: 'uint256' }
    ],
    Fee: [
      { name: 'recipient', type: 'address' },
      { name: 'amount_bp', type: 'uint48' }
    ]
  }