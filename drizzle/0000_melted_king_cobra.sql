CREATE TABLE `translation_usage` (
	`visitor_key` text NOT NULL,
	`usage_date` text NOT NULL,
	`request_count` integer DEFAULT 0 NOT NULL,
	`minute_bucket` integer DEFAULT 0 NOT NULL,
	`minute_count` integer DEFAULT 0 NOT NULL,
	`updated_at` text NOT NULL,
	PRIMARY KEY(`visitor_key`, `usage_date`)
);
