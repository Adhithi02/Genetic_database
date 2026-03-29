import argparse
from pathlib import Path

from database import Base, engine
from etl import clean_and_split_dataset, populate_sql_from_train
from ml import fetch_training_data_from_sql, save_model_metadata, train_logistic_regression


def run_training(dataset_path: Path):
    Base.metadata.create_all(bind=engine)
    train_df, test_df, diseases = clean_and_split_dataset(str(dataset_path))
    populate_sql_from_train(train_df, diseases)

    # Save the 20% test split locally as a CSV
    test_out = dataset_path.with_name(dataset_path.stem + "_test_split.csv")
    test_df.to_csv(test_out, index=False)

    # Build training data from SQL DB
    X_train, y_train = fetch_training_data_from_sql()
    model = train_logistic_regression(X_train, y_train)
    model_id = save_model_metadata(
        model,
        feature_names=X_train.columns.tolist(),
        training_rows=len(X_train),
        notes={
            "dataset": str(dataset_path),
            "records_in_test": len(test_df),
            "test_csv_path": str(test_out),
        },
    )
    print(f"Stored model {model_id} trained on {len(X_train)} rows from {dataset_path}")


def parse_args():
    parser = argparse.ArgumentParser(description="One-off training pipeline for the genetic risk model.")
    parser.add_argument(
        "--dataset",
        type=Path,
        default=Path(r"E:\Desktop\DBMS Lab\genetic-risk-project\cleaned_gwas.csv"),
        help="Path to the cleaned GWAS CSV file.",
    )
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    run_training(args.dataset.resolve())

