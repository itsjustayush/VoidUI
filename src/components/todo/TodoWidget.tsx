import React, { useState } from 'react'
import { CheckSquare, Plus, Trash2, Pin, ChevronDown, ChevronUp } from 'lucide-react'
import { useStore } from '../../store/useStore'

export const TodoWidget: React.FC = () => {
  const todos = useStore((s) => s.todos)
  const addTodo = useStore((s) => s.addTodo)
  const toggleTodo = useStore((s) => s.toggleTodo)
  const deleteTodo = useStore((s) => s.deleteTodo)
  const pinTodo = useStore((s) => s.pinTodo)
  const minimized = useStore((s) => !!s.minimizedWidgets['todo'])
  const toggleMinimized = useStore((s) => s.toggleWidgetMinimized)

  const [inputVal, setInputVal] = useState('')

  const completedCount = todos.filter((t) => t.completed).length
  const totalCount = todos.length
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputVal.trim()) return
    addTodo(inputVal)
    setInputVal('')
  }

  const sortedTodos = [...todos].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1
    if (!a.pinned && b.pinned) return 1
    if (a.completed && !b.completed) return 1
    if (!a.completed && b.completed) return -1
    return b.createdAt - a.createdAt
  })

  if (minimized) {
    return (
      <div className="void-card p-3 select-none flex items-center justify-between transition-all duration-300">
        <div className="flex items-center gap-2.5">
          <CheckSquare className="w-4 h-4 text-nothing-red" />
          <span className="font-ndot text-sm text-white font-medium uppercase tracking-wider">Tasks</span>
          <span className="text-[10px] font-mono text-white/50">
            {completedCount}/{totalCount} ({progressPercent}%)
          </span>
        </div>
        <button
          onClick={() => toggleMinimized('todo')}
          className="p-1 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-all"
          title="Expand tasks"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>
    )
  }

  return (
    <div className="void-card p-5 select-none flex flex-col justify-between h-full min-h-[220px] transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between text-xs font-mono text-white/50 border-b border-white/10 pb-2.5 mb-2">
        <div className="flex items-center gap-1.5">
          <CheckSquare className="w-3.5 h-3.5 text-nothing-red" />
          <span className="font-ndot uppercase tracking-wider text-white/90">TASKS</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-white/40">
            {completedCount}/{totalCount} ({progressPercent}%)
          </span>
          <button
            onClick={() => toggleMinimized('todo')}
            className="p-1 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-all"
            title="Minimize tasks"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mb-3">
        <div
          className="h-full bg-nothing-red transition-all duration-300 rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Add Task Input Form */}
      <form onSubmit={handleAdd} className="flex items-center gap-2 mb-3">
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Add a new task..."
          className="flex-1 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/30 outline-none focus:border-nothing-red"
        />
        <button
          type="submit"
          className="p-1.5 rounded-xl bg-nothing-red hover:bg-nothing-red-bright text-white transition-all shrink-0"
          title="Add task"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </form>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto space-y-1.5 max-h-[140px] pr-1">
        {sortedTodos.map((todo) => (
          <div
            key={todo.id}
            className={`group flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl transition-all ${
              todo.completed ? 'bg-white/[0.02] text-white/40' : 'bg-white/[0.04] text-white/85'
            }`}
          >
            <div
              onClick={() => toggleTodo(todo.id)}
              className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer"
            >
              <div
                className={`w-3.5 h-3.5 rounded-md border flex items-center justify-center transition-colors ${
                  todo.completed
                    ? 'bg-nothing-red border-nothing-red text-white'
                    : 'border-white/30 group-hover:border-white/60'
                }`}
              >
                {todo.completed && <span className="text-[10px]">✓</span>}
              </div>
              <span
                className={`text-xs font-sans truncate ${
                  todo.completed ? 'line-through text-white/40' : 'text-white/90'
                }`}
              >
                {todo.text}
              </span>
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => pinTodo(todo.id)}
                className={`p-1 rounded hover:bg-white/10 ${
                  todo.pinned ? 'text-nothing-red' : 'text-white/40 hover:text-white'
                }`}
                title="Pin task"
              >
                <Pin className="w-3 h-3" />
              </button>
              <button
                onClick={() => deleteTodo(todo.id)}
                className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-nothing-red"
                title="Delete task"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}

        {totalCount === 0 && (
          <div className="py-6 text-center text-xs font-mono text-white/30">
            No tasks yet. Enjoy your day!
          </div>
        )}
      </div>
    </div>
  )
}
