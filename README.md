1. Open the following file in your code editor:  
   `C:\Users\hp\WebstormProjects\otakuz\migrations\adding-activities-and-tournaments-to-events\index.ts`

2. Write the code for your migration.

3. Dry run the migration with the following command:
   ```bash
   sanity migration run adding-activities-and-tournaments-to-events --project=<projectId> --dataset <dataset>
4. Run the migration against a dataset with:
```bash
    `sanity migration run adding-activities-and-tournaments-to-events --project=<projectId> --dataset <dataset> --no-dry-run