CREATE TABLE "audit_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userid" varchar,
	"useremail" text,
	"userrole" text,
	"tablename" text NOT NULL,
	"recordid" text,
	"action" text NOT NULL,
	"olddata" text,
	"newdata" text,
	"ipaddress" text,
	"useragent" text,
	"createdat" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cart_items" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sessionid" text,
	"userid" varchar,
	"productid" varchar NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"createdat" timestamp DEFAULT now() NOT NULL,
	"updatedat" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contact_submissions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"subject" text NOT NULL,
	"message" text NOT NULL,
	"createdat" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"orderid" varchar NOT NULL,
	"productid" varchar NOT NULL,
	"quantity" integer NOT NULL,
	"unitprice" numeric(10, 2) NOT NULL,
	"totalprice" numeric(10, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userid" varchar,
	"customername" text NOT NULL,
	"customeremail" text NOT NULL,
	"customerphone" text,
	"shippingaddress" text NOT NULL,
	"totalamount" numeric(10, 2) NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"createdat" timestamp DEFAULT now() NOT NULL,
	"updatedat" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"image_url" text NOT NULL,
	"category" text NOT NULL,
	"stock" integer DEFAULT 0 NOT NULL,
	"featured" boolean DEFAULT false,
	"createdat" timestamp DEFAULT now() NOT NULL,
	"updatedat" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"name" text NOT NULL,
	"role" text DEFAULT 'customer' NOT NULL,
	"phone" text,
	"address" text,
	"is_active" boolean DEFAULT true,
	"createdat" timestamp DEFAULT now() NOT NULL,
	"updatedat" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userid_users_id_fk" FOREIGN KEY ("userid") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_userid_users_id_fk" FOREIGN KEY ("userid") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_productid_products_id_fk" FOREIGN KEY ("productid") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_orderid_orders_id_fk" FOREIGN KEY ("orderid") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_productid_products_id_fk" FOREIGN KEY ("productid") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_userid_users_id_fk" FOREIGN KEY ("userid") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;