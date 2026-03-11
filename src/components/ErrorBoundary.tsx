import { Button, Center, Stack, Text, Title } from '@mantine/core';
import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Center h="100vh">
          <Stack align="center" gap="sm">
            <Title order={3} c="red">Đã xảy ra lỗi</Title>
            <Text c="dimmed" size="sm">{this.state.error?.message}</Text>
            <Button variant="light" onClick={() => this.setState({ hasError: false, error: null })}>
              Thử lại
            </Button>
          </Stack>
        </Center>
      );
    }
    return this.props.children;
  }
}
