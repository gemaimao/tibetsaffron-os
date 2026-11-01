import AppKit
import Foundation
import Security

let service = "ai.typesafe.api-key"
let account = NSUserName()
guard let key = NSPasteboard.general.string(forType: .string)?.trimmingCharacters(in: .whitespacesAndNewlines), !key.isEmpty else {
    fputs("剪贴板中没有可用的文本密钥。\n", stderr)
    exit(2)
}

let query: [String: Any] = [
    kSecClass as String: kSecClassGenericPassword,
    kSecAttrService as String: service,
    kSecAttrAccount as String: account,
]
let attributes: [String: Any] = [kSecValueData as String: Data(key.utf8)]
let updateStatus = SecItemUpdate(query as CFDictionary, attributes as CFDictionary)
let status = updateStatus == errSecItemNotFound
    ? SecItemAdd(query.merging(attributes) { _, new in new } as CFDictionary, nil)
    : updateStatus

guard status == errSecSuccess else {
    fputs("无法将 TypeSafe API Key 保存到 macOS 钥匙串（状态码 \(status)）。\n", stderr)
    exit(1)
}
print("TypeSafe API Key 已安全保存到当前 macOS 用户钥匙串；密钥未显示。")
