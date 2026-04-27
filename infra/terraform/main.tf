provider "aws" {
  region = var.aws_region
}

locals {
  build_spec = file("${path.module}/../../amplify.yml")
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

  enable_branch_auto_build = true
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
