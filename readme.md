📖 The "Why" Behind the Design
I didn't want this to be another generic CRUD app. For Stage 1, I focused on building the "guts" of the bank—making sure the logic was bulletproof before even thinking about the UI. I moved from a NoSQL mindset to a high-integrity PostgreSQL setup because, in a bank, every action needs a real audit trail.

🧠 My Thought Process & Architecting
I took some standard advice and tweaked it to fit my actual needs. Here’s how I handled the big decisions:

1. The "Deep Clean" Exception System
   I had a specific vision for how the app should talk back when things go wrong. Instead of a generic error handler, I wanted the Service to own the context.

My custom exceptions (like BusinessLogicException) act as containers—they carry the HTTP Status and Error Code, but I write the actual message in the Service where the error happens.

It feels more natural: if a user can't be deleted, the Service knows exactly why, so it should be the one to say it.

I also wrestled with some Jackson databind errors in the IDE, but I forced the imports to behave so the API returns clean, professional JSON instead of a wall of red text.

2. The Account Closing & User Deletion Rules
   This was the most critical part to get right. Deleting a user in a bank isn't just a simple button click.

The Zero Balance Rule: I enforced a strict guardrail: you can’t delete a user if they have even a cent left in any account. No "lost money" allowed.

Fixing the DRY Issue: I realized that putting account-specific logic inside the UserService was repetitive. I changed it so the UserService calls the AccountService to handle the closing of individual accounts. Now, if the rules for closing an account change, I only fix it in one place.

Soft Deleting: Instead of wiping rows from the database, I’m flipping a Status to CLOSED and using Hibernate's @SoftDelete. The data stays for the bank's records (auditing), but it's "gone" for the user.

🧪 Testing
I used JUnit 5 and Mockito to fake the database so I could test the logic in isolation and at high speed.

I wrote two main tests:

One to prove the system successfully blocks a user deletion if they still have money.

One to prove that when a user is deleted, the system correctly force-closes every account they owned.

Seeing those green checkmarks gives me a safety net for when I inevitably change something later and need to make sure I didn't break the core bank rules.

🚦 Stage 1 Status: COMPLETE
The "brain" of the app is working and verified.

Next Step: Move to Stage 2: The Controller Layer. I’ll be building the actual API endpoints so I can finally hit this with Postman and see those custom error messages and logic flows in action.
I will also add more complext details in banking logic such as transactions and loans in upcoming stages of development (from the roadmap I made 
before starting with this project, I will also be adding Spring Security at great depth as security in Banking is like the core feature.)