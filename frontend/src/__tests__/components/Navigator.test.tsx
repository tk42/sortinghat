import { render, screen, fireEvent } from '@testing-library/react'
import Navigator from '@/src/components/chat/Navigator'
import { ConversationStep } from '@/src/lib/interfaces'

describe('Navigator', () => {
  const defaultProps = {
    currentStep: 'initial' as ConversationStep,
    onBack: jest.fn(),
    onNext: jest.fn(),
    isLoading: false,
    nextDisabled: false,
    showInfo: true,
    infoText: 'Test info text',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders correctly with basic props', () => {
    render(<Navigator {...defaultProps} />)
    
    expect(screen.getByText('Test info text')).toBeInTheDocument()
    expect(screen.getByText('次へ')).toBeInTheDocument()
  })

  it('shows back button when not on initial step', () => {
    render(<Navigator {...defaultProps} currentStep="class_setup" />)
    
    expect(screen.getByText('戻る')).toBeInTheDocument()
  })

  it('hides back button on initial step', () => {
    render(<Navigator {...defaultProps} currentStep="initial" />)
    
    expect(screen.queryByText('戻る')).not.toBeInTheDocument()
  })

  it('disables next button when nextDisabled is true', () => {
    render(<Navigator {...defaultProps} nextDisabled={true} />)
    
    const nextButton = screen.getByText('次へ')
    expect(nextButton).toBeDisabled()
  })

  it('calls onBack when back button is clicked', () => {
    render(<Navigator {...defaultProps} currentStep="class_setup" />)
    
    fireEvent.click(screen.getByText('戻る'))
    expect(defaultProps.onBack).toHaveBeenCalledTimes(1)
  })

  it('calls onNext when next button is clicked', () => {
    render(<Navigator {...defaultProps} />)
    
    fireEvent.click(screen.getByText('次へ'))
    expect(defaultProps.onNext).toHaveBeenCalledTimes(1)
  })

  it('shows result confirmation buttons on result_confirmation step', () => {
    const mockExport = jest.fn()
    const mockSave = jest.fn()
    
    render(
      <Navigator
        {...defaultProps}
        currentStep="result_confirmation"
        teamsCount={3}
        studentsCount={24}
        onExportResults={mockExport}
        onSaveResults={mockSave}
      />
    )
    
    expect(screen.getByText('CSVエクスポート')).toBeInTheDocument()
    expect(screen.getByText('結果を保存')).toBeInTheDocument()
    expect(screen.getByText('チーム編成結果: 3チーム、計24名')).toBeInTheDocument()
  })

  it('calls export function when export button is clicked', () => {
    const mockExport = jest.fn()
    
    render(
      <Navigator
        {...defaultProps}
        currentStep="result_confirmation"
        onExportResults={mockExport}
        onSaveResults={jest.fn()}
      />
    )
    
    fireEvent.click(screen.getByText('CSVエクスポート'))
    expect(mockExport).toHaveBeenCalledTimes(1)
  })
})