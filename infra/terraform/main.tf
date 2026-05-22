provider "aws" {
  region = var.aws_region
}

locals {
  build_spec   = file("${path.module}/../../amplify.yml")
  name_slug    = lower(replace(var.app_name, "/[^a-zA-Z0-9-]/", "-"))
  display_name = var.app_name
}

data "aws_availability_zones" "available" {
  state = "available"
}

import {
  to = aws_amplify_app.chosen_warriors
  id = "d2zuotoinh17on"
}

import {
  to = aws_amplify_branch.main
  id = "d2zuotoinh17on/main"
}

resource "aws_amplify_app" "chosen_warriors" {
  name       = var.app_name
  repository = var.repository_url
  platform   = "WEB"

  build_spec = local.build_spec

  enable_branch_auto_build    = true
  enable_branch_auto_deletion = false
  enable_auto_branch_creation = false

  custom_rule {
    source = "/<*>"
    target = "/index.html"
    status = "404-200"
  }

  cache_config {
    type = "AMPLIFY_MANAGED_NO_COOKIES"
  }

  lifecycle {
    ignore_changes = [
      access_token,
      oauth_token,
    ]
  }
}

resource "aws_amplify_branch" "main" {
  app_id      = aws_amplify_app.chosen_warriors.id
  branch_name = var.branch_name

  display_name = var.branch_name
  framework    = "Web"
  stage        = "PRODUCTION"

  enable_auto_build           = true
  enable_basic_auth           = false
  enable_notification         = false
  enable_performance_mode     = false
  enable_pull_request_preview = false
}

resource "aws_db_subnet_group" "chosen_warriors" {
  name       = "${local.name_slug}-postgres-subnets"
  subnet_ids = aws_subnet.database[*].id

  tags = {
    Name = "${var.app_name} PostgreSQL subnet group"
  }
}

resource "aws_vpc" "database" {
  cidr_block           = var.database_vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "${var.app_name} database"
  }
}

resource "aws_internet_gateway" "database" {
  vpc_id = aws_vpc.database.id

  tags = {
    Name = "${var.app_name} database"
  }
}

resource "aws_subnet" "database" {
  count = 2

  vpc_id                  = aws_vpc.database.id
  cidr_block              = cidrsubnet(var.database_vpc_cidr, 8, count.index + 1)
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = var.database_publicly_accessible

  tags = {
    Name = "${var.app_name} database ${count.index + 1}"
  }
}

resource "aws_route_table" "database" {
  vpc_id = aws_vpc.database.id

  dynamic "route" {
    for_each = var.database_publicly_accessible ? [1] : []
    content {
      cidr_block = "0.0.0.0/0"
      gateway_id = aws_internet_gateway.database.id
    }
  }

  tags = {
    Name = "${var.app_name} database"
  }
}

resource "aws_route_table_association" "database" {
  count = length(aws_subnet.database)

  subnet_id      = aws_subnet.database[count.index].id
  route_table_id = aws_route_table.database.id
}

resource "aws_security_group" "postgres" {
  name        = "${local.name_slug}-postgres"
  description = "PostgreSQL access for the Chosen Warriors API"
  vpc_id      = aws_vpc.database.id

  dynamic "ingress" {
    for_each = var.database_allowed_cidr_blocks
    content {
      description = "Trusted PostgreSQL client"
      from_port   = 5432
      to_port     = 5432
      protocol    = "tcp"
      cidr_blocks = [ingress.value]
    }
  }

  egress {
    description = "Allow outbound database responses"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.app_name} PostgreSQL"
  }
}

resource "aws_db_instance" "postgres" {
  identifier = "${local.name_slug}-postgres"

  engine         = "postgres"
  engine_version = "16"
  instance_class = var.database_instance_class

  db_name  = var.database_name
  username = var.database_username

  manage_master_user_password = true

  allocated_storage     = var.database_allocated_storage
  max_allocated_storage = var.database_max_allocated_storage
  storage_type          = "gp3"
  storage_encrypted     = true

  db_subnet_group_name   = aws_db_subnet_group.chosen_warriors.name
  vpc_security_group_ids = [aws_security_group.postgres.id]
  publicly_accessible    = var.database_publicly_accessible

  backup_retention_period = 7
  backup_window           = "07:00-08:00"
  maintenance_window      = "sun:08:00-sun:09:00"

  auto_minor_version_upgrade = true
  deletion_protection        = true
  skip_final_snapshot        = false
  final_snapshot_identifier  = "${local.name_slug}-postgres-final"

  tags = {
    Name = "${var.app_name} PostgreSQL"
  }
}
