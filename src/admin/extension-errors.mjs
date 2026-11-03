/** Workspace copy: English and Chinese only. Historical business text is unchanged. */

export const WORKBENCH_ERRORS = {
  "MODEL_SETTINGS_CHANGED": {
    "en": "The model destination changed. Review the new destination and consent again.",
    "zh": "模型目标已更改，请核对新目标后重新确认发送。"
  },
  "MODEL_ENDPOINT_NOT_ALLOWED": {
    "en": "This model host is not allowed by the deployment configuration.",
    "zh": "部署配置未允许此模型主机。"
  },
  "MODEL_NOT_CONFIGURED": {
    "en": "Configure and save an enabled model with a valid key before using it.",
    "zh": "请先保存已启用的模型及有效密钥。"
  },
  "MODEL_KEY_REQUIRED": {
    "en": "Configure and save an enabled model with a valid key before using it.",
    "zh": "请先保存已启用的模型及有效密钥。"
  },
  "MODEL_KEY_UNAVAILABLE": {
    "en": "Configure and save an enabled model with a valid key before using it.",
    "zh": "请先保存已启用的模型及有效密钥。"
  },
  "ENCRYPTION_UNAVAILABLE": {
    "en": "Model-key encryption is unavailable. Ask the deployment owner to configure it.",
    "zh": "模型密钥加密不可用，请由部署所有者配置。"
  },
  "MODEL_CONSENT_REQUIRED": {
    "en": "Explicitly confirm transmission to the configured model provider.",
    "zh": "请明确同意向当前模型服务商发送所选上下文。"
  },
  "MODEL_CONNECTION_FAILED": {
    "en": "The model request failed or returned an unsupported response. Your input has been kept.",
    "zh": "模型请求失败或返回内容不受支持，输入已保留。"
  },
  "MODEL_RESPONSE_INVALID": {
    "en": "The model request failed or returned an unsupported response. Your input has been kept.",
    "zh": "模型请求失败或返回内容不受支持，输入已保留。"
  },
  "MODEL_RESPONSE_TOO_LARGE": {
    "en": "The model request failed or returned an unsupported response. Your input has been kept.",
    "zh": "模型请求失败或返回内容不受支持，输入已保留。"
  },
  "CONVERSATION_BUSY": {
    "en": "This operation is already running. Review its history before retrying.",
    "zh": "此操作已在运行，请查看历史后再重试。"
  },
  "RUN_BUSY": {
    "en": "This operation is already running. Review its history before retrying.",
    "zh": "此操作已在运行，请查看历史后再重试。"
  },
  "RUN_IN_PROGRESS": {
    "en": "This operation is already running. Review its history before retrying.",
    "zh": "此操作已在运行，请查看历史后再重试。"
  },
  "RUN_FAILED": {
    "en": "The run did not complete. Its history shows the saved state and failure reason.",
    "zh": "运行未完成，请在历史中查看保存的状态和失败原因。"
  },
  "RUN_INTERRUPTED": {
    "en": "The run did not complete. Its history shows the saved state and failure reason.",
    "zh": "运行未完成，请在历史中查看保存的状态和失败原因。"
  },
  "LEASE_LOST": {
    "en": "The run did not complete. Its history shows the saved state and failure reason.",
    "zh": "运行未完成，请在历史中查看保存的状态和失败原因。"
  },
  "CONVERSATION_ARCHIVED": {
    "en": "Restore this archived record before editing it.",
    "zh": "请恢复此归档记录后再编辑。"
  },
  "RECORD_ARCHIVED": {
    "en": "Restore this archived record before editing it.",
    "zh": "请恢复此归档记录后再编辑。"
  },
  "DOCUMENT_UNAVAILABLE": {
    "en": "A selected document is unavailable or archived. Refresh the document selection.",
    "zh": "所选文档不可用或已归档，请刷新文档选择。"
  },
  "UNSUPPORTED_DOCUMENT_TYPE": {
    "en": "Use text or Markdown documents (.txt, .md, .markdown). PDF and Office files are not supported here.",
    "zh": "请使用文本或 Markdown（.txt、.md、.markdown），此入口不支持 PDF 与 Office 文件。"
  },
  "SENSITIVE_CONTENT": {
    "en": "Remove passwords, private keys and API credentials before saving business knowledge.",
    "zh": "请先移除密码、私钥及 API 凭据，再保存业务知识。"
  },
  "LICENSE_VERIFICATION_UNAVAILABLE": {
    "en": "Signed-license verification is not configured for this deployment. Existing functions remain available.",
    "zh": "此部署未配置签名许可验证，现有功能保持可用。"
  },
  "LICENSE_INVALID": {
    "en": "This license is invalid, expired or belongs to another instance.",
    "zh": "此许可无效、已到期或不属于当前实例。"
  },
  "LICENSE_EXPIRED": {
    "en": "This license is invalid, expired or belongs to another instance.",
    "zh": "此许可无效、已到期或不属于当前实例。"
  },
  "INVALID_MAPPING": {
    "en": "Map every required field to an existing CSV column, then preview again.",
    "zh": "请将每个必填字段映射至现有 CSV 列，再次预览。"
  },
  "MISSING_MAPPING": {
    "en": "Map every required field to an existing CSV column, then preview again.",
    "zh": "请将每个必填字段映射至现有 CSV 列，再次预览。"
  },
  "INVALID_CSV": {
    "en": "Check the CSV header, quoting and column counts. Your data has been kept.",
    "zh": "请检查 CSV 表头、引号和列数，输入数据已保留。"
  },
  "INVALID_FORMAT": {
    "en": "Check the CSV header, quoting and column counts. Your data has been kept.",
    "zh": "请检查 CSV 表头、引号和列数，输入数据已保留。"
  },
  "INVALID_ROW": {
    "en": "Check the CSV header, quoting and column counts. Your data has been kept.",
    "zh": "请检查 CSV 表头、引号和列数，输入数据已保留。"
  },
  "CSV_LIMIT": {
    "en": "Split this import into CSV files of at most 500 data rows and 1 MiB.",
    "zh": "请拆分 CSV，每批最多 500 行数据及 1 MiB。"
  },
  "CSV_ROW_LIMIT": {
    "en": "Split this import into CSV files of at most 500 data rows and 1 MiB.",
    "zh": "请拆分 CSV，每批最多 500 行数据及 1 MiB。"
  },
  "IMPORT_CAPACITY": {
    "en": "Finish or discard existing previews before creating another import batch.",
    "zh": "请先完成或取消已有预览，再创建新导入批次。"
  },
  "IMPORT_STARTED": {
    "en": "This batch has started. Continue its saved import instead of discarding it.",
    "zh": "此批次已开始，请继续已保存的导入流程。"
  },
  "SOURCE_PAUSED": {
    "en": "Enable this source or rule before running it.",
    "zh": "请先启用此来源或规则，再执行运行。"
  },
  "RULE_PAUSED": {
    "en": "Enable this source or rule before running it.",
    "zh": "请先启用此来源或规则，再执行运行。"
  },
  "CSV_UPLOAD_REQUIRED": {
    "en": "CSV sources update through a new preview and committed import. Upload the latest export.",
    "zh": "CSV 来源通过新预览并提交后更新，请导入最新导出文件。"
  },
  "INVALID_AMOUNT": {
    "en": "Check the currency and nonnegative amount. JPY and KRW use whole amounts.",
    "zh": "请检查币种与非负金额，日元和韩元仅支持整数。"
  },
  "INVALID_CURRENCY": {
    "en": "Check the currency and nonnegative amount. JPY and KRW use whole amounts.",
    "zh": "请检查币种与非负金额，日元和韩元仅支持整数。"
  },
  "CURRENCY_MISMATCH": {
    "en": "Check the currency and nonnegative amount. JPY and KRW use whole amounts.",
    "zh": "请检查币种与非负金额，日元和韩元仅支持整数。"
  },
  "INVALID_DATE": {
    "en": "Use valid dates and an allowed date range. Source timestamps require a timezone.",
    "zh": "请使用有效日期及允许的日期范围，来源时间必须含时区。"
  },
  "MISSING_DATE": {
    "en": "Use valid dates and an allowed date range. Source timestamps require a timezone.",
    "zh": "请使用有效日期及允许的日期范围，来源时间必须含时区。"
  },
  "INVALID_RANGE": {
    "en": "Use valid dates and an allowed date range. Source timestamps require a timezone.",
    "zh": "请使用有效日期及允许的日期范围，来源时间必须含时区。"
  },
  "INVALID_QUANTITY": {
    "en": "Enter a positive whole-number quantity.",
    "zh": "请输入正整数数量。"
  },
  "MISSING_ORDER": {
    "en": "Import the related order first and give every line item a stable, unique reference.",
    "zh": "请先导入关联订单，并为每条明细提供稳定且唯一的参考编号。"
  },
  "MISSING_ITEM_ID": {
    "en": "Import the related order first and give every line item a stable, unique reference.",
    "zh": "请先导入关联订单，并为每条明细提供稳定且唯一的参考编号。"
  },
  "AMBIGUOUS_ITEM_ID": {
    "en": "Import the related order first and give every line item a stable, unique reference.",
    "zh": "请先导入关联订单，并为每条明细提供稳定且唯一的参考编号。"
  }
};
