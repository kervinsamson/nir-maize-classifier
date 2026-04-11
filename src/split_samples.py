import pandas as pd
import os

# Load the full dataset and the labeled dataset (for protein class)
df = pd.read_csv('../data/raw/corn_mp5_regression_data.csv')
labeled = pd.read_csv('../data/processed/labeled.csv')[['SampleID', 'Protein_Label']]

# Keep only the 700 wavelength columns — drop SampleID, Moisture, Starch, Oil, Protein
wave_cols = [col for col in df.columns if col.startswith('Wave_')]
df_waves = df[['SampleID'] + wave_cols]

# Merge protein label into the wavelength dataframe
df_waves = df_waves.merge(labeled, on='SampleID', how='left')

# Output folder
output_dir = '../data/raw/samples'
os.makedirs(output_dir, exist_ok=True)

# Split each row into its own CSV file
for _, row in df_waves.iterrows():
    sample_id = row['SampleID']
    protein_class = 'high_protein' if row['Protein_Label'] == 1 else 'low_protein'

    # Keep only the 700 wavelength values — no SampleID in the output
    sample_df = pd.DataFrame([row[wave_cols].values], columns=wave_cols)

    # Save as individual CSV with protein class in the filename
    output_path = os.path.join(output_dir, f'{sample_id}_{protein_class}.csv')
    sample_df.to_csv(output_path, index=False, header=False)  # No header for cleaner files
    print(f'Saved: {output_path}')

print(f'\nDone. {len(df_waves)} sample files saved to ./{output_dir}/')