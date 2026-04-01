import pandas as pd

df = pd.read_csv('../cleaned_gwas.csv')
print("Columns:", list(df.columns))
print()

for d in df['disease'].unique():
    subset = df[df['disease'] == d]
    sample_rsids = list(subset['rsid'].head(5))
    print(f"{d}: {len(subset)} SNPs")
    print(f"  Sample rsIDs: {sample_rsids}")
    print(f"  Odds ratio range: {subset['odds_ratio'].min():.3f} - {subset['odds_ratio'].max():.3f}")
    print()
