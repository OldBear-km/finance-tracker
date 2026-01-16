{ pkgs, ... }: {
  # Используем стабильный канал Nix для получения пакетов
  channel = "stable-24.05";

  # Список пакетов, которые нужно установить в окружение
  packages = [
    pkgs.python3  # Устанавливаем Python 3
    pkgs.pip      # Устанавливаем менеджер пакетов pip
  ];

  # Конфигурация для Firebase Studio
  idx = {
    # Список расширений VS Code для установки
    extensions = [
      "ms-python.python"  # Официальное расширение Python
    ];
  };
}
