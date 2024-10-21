import pymysql  # or use pymysql if you're using that library

# Connection settings
db_host = 'cmpe451.cr2akoqe438k.eu-north-1.rds.amazonaws.com'  # Replace with your RDS endpoint
db_user = 'admin'  # Replace with your MySQL username
db_pass = 'yxf-CUC.mgk2khq1qta'  # Replace with your MySQL password
db_name = 'cmpe451'  # Replace with your database name
db_port = 3306  # MySQL default port

try:
    # Connect to the database
    connection = pymysql.connect(
        host=db_host,
        user=db_user,
        passwd=db_pass,
        db=db_name,
        port=db_port
    )
    print("Connection successful!")

    # Create a cursor to execute SQL queries
    cursor = connection.cursor()

    # Execute a simple query (e.g., show tables)
    cursor.execute("SHOW TABLES;")
    tables = cursor.fetchall()
    print("Tables in the database:")
    for table in tables:
        print(table)

    # Close the connection
    cursor.close()
    connection.close()

except Exception as e:
    print(f"Failed to connect to the database: {e}")
