import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

const Index = () => {
  const [authStep, setAuthStep] = useState<'phone' | 'code' | '2fa' | 'authenticated'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [twoFaCode, setTwoFaCode] = useState('');

  const commands = [
    {
      name: '!bots',
      description: 'Показывает всех ботов в чате',
      usage: '!bots',
      color: 'text-terminal-green'
    },
    {
      name: '!nick',
      description: 'Изменяет ваш никнейм в Telegram',
      usage: '!nick "новое имя"',
      color: 'text-terminal-blue'
    },
    {
      name: '!leave',
      description: 'Автоматический выход из чата',
      usage: '!leave',
      color: 'text-terminal-red'
    },
    {
      name: '!info',
      description: 'Показывает ID и номер телефона пользователя',
      usage: '!info "username"',
      color: 'text-terminal-blue'
    }
  ];

  const [logs] = useState([
    { time: '14:32:01', action: 'Команда !bots выполнена в чате "Разработка"', status: 'success' },
    { time: '14:31:45', action: 'Никнейм изменен: User -> CyberUser', status: 'success' },
    { time: '14:30:22', action: 'Запрос !info @johndoe', status: 'success' },
    { time: '14:29:10', action: 'Выход из чата "Spam Group"', status: 'warning' },
    { time: '14:28:03', action: 'Подключение к Telegram успешно', status: 'success' }
  ]);

  const handleAuth = () => {
    if (authStep === 'phone' && phone) {
      setAuthStep('code');
    } else if (authStep === 'code' && code) {
      setAuthStep('2fa');
    } else if (authStep === '2fa' && twoFaCode) {
      setAuthStep('authenticated');
    }
  };

  if (authStep !== 'authenticated') {
    return (
      <div className="min-h-screen bg-terminal-dark flex items-center justify-center p-4 scan-line">
        <Card className="w-full max-w-md bg-card/95 border-border backdrop-blur-sm">
          <div className="p-6 space-y-6">
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Icon name="Terminal" size={32} className="text-primary terminal-glow" />
                <h1 className="text-2xl font-bold text-primary terminal-glow">TG_CONTROL</h1>
              </div>
              <p className="text-sm text-muted-foreground">
                {authStep === 'phone' && '> Введите номер телефона для авторизации'}
                {authStep === 'code' && '> Введите код подтверждения из Telegram'}
                {authStep === '2fa' && '> Введите код двухфакторной аутентификации'}
              </p>
            </div>

            <div className="space-y-4">
              {authStep === 'phone' && (
                <div className="space-y-2">
                  <label className="text-xs text-primary">PHONE_NUMBER:</label>
                  <Input
                    type="tel"
                    placeholder="+7 999 123 45 67"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="font-mono bg-input border-border text-foreground"
                  />
                </div>
              )}

              {authStep === 'code' && (
                <div className="space-y-2">
                  <label className="text-xs text-primary">VERIFICATION_CODE:</label>
                  <Input
                    type="text"
                    placeholder="12345"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="font-mono bg-input border-border text-foreground"
                    maxLength={5}
                  />
                </div>
              )}

              {authStep === '2fa' && (
                <div className="space-y-2">
                  <label className="text-xs text-primary">TWO_FACTOR_AUTH:</label>
                  <Input
                    type="password"
                    placeholder="Пароль или код с почты"
                    value={twoFaCode}
                    onChange={(e) => setTwoFaCode(e.target.value)}
                    className="font-mono bg-input border-border text-foreground"
                  />
                </div>
              )}

              <Button 
                onClick={handleAuth}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 terminal-glow"
              >
                <Icon name="ArrowRight" size={16} className="mr-2" />
                {authStep === 'phone' && 'ОТПРАВИТЬ КОД'}
                {authStep === 'code' && 'ПОДТВЕРДИТЬ'}
                {authStep === '2fa' && 'ВОЙТИ'}
              </Button>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-4 border-t border-border">
              <Icon name="Shield" size={14} />
              <span>Защищенное соединение</span>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-terminal-dark scan-line">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon name="Terminal" size={24} className="text-primary terminal-glow" />
            <h1 className="text-xl font-bold text-primary terminal-glow">TG_CONTROL</h1>
            <Badge variant="outline" className="border-primary text-primary ml-2">
              <span className="w-2 h-2 rounded-full bg-primary mr-2 animate-pulse"></span>
              ONLINE
            </Badge>
          </div>
          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
            <Icon name="LogOut" size={16} className="mr-2" />
            ВЫХОД
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="logs" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-card/50 mb-6">
            <TabsTrigger value="logs" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Icon name="ScrollText" size={16} className="mr-2" />
              ЛОГИ
            </TabsTrigger>
            <TabsTrigger value="commands" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Icon name="Code" size={16} className="mr-2" />
              КОМАНДЫ
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Icon name="Settings" size={16} className="mr-2" />
              НАСТРОЙКИ
            </TabsTrigger>
          </TabsList>

          <TabsContent value="logs" className="space-y-4">
            <Card className="bg-card/95 border-border">
              <div className="p-4 border-b border-border">
                <h2 className="text-lg font-semibold text-primary flex items-center gap-2">
                  <Icon name="Activity" size={20} />
                  АКТИВНОСТЬ В РЕАЛЬНОМ ВРЕМЕНИ
                </h2>
              </div>
              <ScrollArea className="h-[500px]">
                <div className="p-4 space-y-2 font-mono text-sm">
                  {logs.map((log, i) => (
                    <div 
                      key={i} 
                      className="flex items-start gap-3 p-3 rounded bg-muted/30 hover:bg-muted/50 transition-colors animate-fade-in"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    >
                      <span className="text-muted-foreground whitespace-nowrap">[{log.time}]</span>
                      <span className={
                        log.status === 'success' ? 'text-terminal-green' : 
                        log.status === 'warning' ? 'text-terminal-red' : 
                        'text-foreground'
                      }>
                        {log.action}
                      </span>
                      {log.status === 'success' && <Icon name="CheckCircle" size={16} className="text-terminal-green ml-auto" />}
                      {log.status === 'warning' && <Icon name="AlertTriangle" size={16} className="text-terminal-red ml-auto" />}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          </TabsContent>

          <TabsContent value="commands" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {commands.map((cmd, i) => (
                <Card 
                  key={i} 
                  className="bg-card/95 border-border hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10 animate-fade-in"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <Icon name="Terminal" size={20} className={cmd.color} />
                      <h3 className={`text-xl font-bold font-mono ${cmd.color} terminal-glow`}>
                        {cmd.name}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {cmd.description}
                    </p>
                    <div className="pt-2 border-t border-border">
                      <p className="text-xs text-muted-foreground mb-1">ИСПОЛЬЗОВАНИЕ:</p>
                      <code className="text-sm text-primary bg-muted/50 px-2 py-1 rounded">
                        {cmd.usage}
                      </code>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card className="bg-card/95 border-border">
              <div className="p-4 border-b border-border">
                <h2 className="text-lg font-semibold text-primary flex items-center gap-2">
                  <Icon name="Settings" size={20} />
                  КОНФИГУРАЦИЯ
                </h2>
              </div>
              <div className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded bg-muted/30">
                    <div>
                      <p className="font-semibold text-foreground">Статус бота</p>
                      <p className="text-sm text-muted-foreground">Управление активностью</p>
                    </div>
                    <Badge className="bg-primary text-primary-foreground">АКТИВЕН</Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded bg-muted/30">
                    <div>
                      <p className="font-semibold text-foreground">Номер телефона</p>
                      <p className="text-sm text-muted-foreground font-mono">{phone || '+7 999 123 45 67'}</p>
                    </div>
                    <Icon name="Phone" size={20} className="text-primary" />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded bg-muted/30">
                    <div>
                      <p className="font-semibold text-foreground">Автозапуск команд</p>
                      <p className="text-sm text-muted-foreground">Мгновенное выполнение</p>
                    </div>
                    <Badge variant="outline" className="border-primary text-primary">ВКЛ</Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded bg-muted/30">
                    <div>
                      <p className="font-semibold text-foreground">Логирование</p>
                      <p className="text-sm text-muted-foreground">Запись всех действий</p>
                    </div>
                    <Badge variant="outline" className="border-primary text-primary">ВКЛ</Badge>
                  </div>
                </div>

                <Button variant="destructive" className="w-full">
                  <Icon name="Power" size={16} className="mr-2" />
                  ЗАВЕРШИТЬ СЕССИЮ
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
