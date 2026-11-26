# Architecture rules
- Product option configuration uses the existing products.options_config field and shared productOptions helpers; admin editing and site selection use focused components without changing PDV flows.
- AI menu recommendations run in the `recomendar-produtos` edge function via Lovable AI Gateway (Responses, shared helpers in supabase/functions/_shared); the client sends the visible menu and the function only returns IDs from it, so suggestions never point to hidden products.
