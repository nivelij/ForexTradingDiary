-- Forex Trading Diary SQL Schema (CockroachDB Compatible)
-- This schema is designed to store trading accounts, trades, and their associated screenshots.

-- -------------------------------------------------------------
-- Table for storing user's trading accounts
-- FR-101, FR-102: Manages multiple accounts with currency and balance.
-- -------------------------------------------------------------
CREATE TABLE trading_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    initial_balance DECIMAL(15, 2) NOT NULL,
    current_balance DECIMAL(15, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add an index on the account name for faster lookups
CREATE INDEX ON trading_accounts(name);

-- -------------------------------------------------------------
-- Table for storing individual trade entries
-- FR-201, FR-202, FR-204, FR-206: Manages trade details.
-- -------------------------------------------------------------
CREATE TABLE trades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL,
    currency_pair VARCHAR(20) NOT NULL,
    direction VARCHAR(10) NOT NULL CHECK (direction IN ('BUY', 'SELL')),
    rationale TEXT NOT NULL,
    outcome VARCHAR(20) NOT NULL DEFAULT 'OPEN' CHECK (outcome IN ('OPEN', 'WIN', 'LOSS', 'BREAK_EVEN')),
    profit_loss DECIMAL(15, 2),
    retrospective TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT fk_account
        FOREIGN KEY(account_id) 
        REFERENCES trading_accounts(id)
        ON DELETE CASCADE
);

-- Add indexes for common query patterns
CREATE INDEX ON trades(account_id);
CREATE INDEX ON trades(currency_pair);
CREATE INDEX ON trades(outcome);

-- -------------------------------------------------------------
-- Table for storing trade screenshots
-- FR-203: Allows for storing multiple screenshots per trade.
-- This design uses BYTES to store the image data directly in the database.
-- -------------------------------------------------------------
CREATE TABLE trade_screenshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trade_id UUID NOT NULL,
    image_data BYTES NOT NULL,
    mime_type VARCHAR(50) NOT NULL, -- e.g., 'image/png', 'image/jpeg'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT fk_trade
        FOREIGN KEY(trade_id)
        REFERENCES trades(id)
        ON DELETE CASCADE
);

-- Add an index on trade_id for faster retrieval of all images for a specific trade
CREATE INDEX ON trade_screenshots(trade_id);
